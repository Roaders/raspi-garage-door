import io from 'socket.io-client';
import { IAuthToken, ILoggingTarget } from './contracts';
import { Subject, interval, Subscription } from 'rxjs';
import { take, mergeMap } from 'rxjs/operators';
import { printError } from './helpers';

const initialReconnectDelay = 500;
const maxReconnectDelay = 60000;

export class SocketFactory {
    constructor(private logger: ILoggingTarget) {}

    private _socket: SocketIOClient.Socket | undefined;
    private _socketSubject = new Subject<SocketIOClient.Socket>();
    private _token: IAuthToken | undefined;

    private _reconnectSubscription: Subscription | undefined;
    private _reconnectTimeout: number = initialReconnectDelay;

    public get socketStream() {
        return this._socketSubject.asObservable();
    }

    public close() {
        if (this._socket != null) {
            this._socket.close();
            this._reconnectSubscription?.unsubscribe();
        }
    }

    public createSocket(token: IAuthToken, baseUrl: string, tokenFactory: (token: IAuthToken) => Promise<IAuthToken>) {
        if (this._token?.access_token === token.access_token && this._token.refresh_token === token.refresh_token) {
            return;
        }
        if (this._socket != null) {
            this._socket.close();
            this.resetReconnection();
        }

        this._token = token;

        const url = `${baseUrl}?token=${token.access_token}`;

        try {
            const socket = io(url, { reconnection: false });
            this._socket = socket;

            socket.on('connect', () => {
                this.logger.log(`SocketFactory: SOCKET CONNECTED`);
                this.resetReconnection();
            });

            socket.on('reconnect', () => this.logger.log(`SocketFactory: reconnect`));
            socket.on('reconnect_failed', () => this.logger.log(`SocketFactory: reconnect_failed`));
            socket.on('reconnect_error', () => this.logger.log(`SocketFactory: reconnect_error`));
            socket.on('reconnecting', (count: number) => this.logger.log(`SocketFactory: reconnecting ${count}`));
            socket.on('error', (error: any) => this.logger.log(`SocketFactory: Error from stream: ${error}`));

            socket.on('disconnect', () => {
                this.logger.log(`GarageDoorHttpService: disconnect`);
                this._socket?.close();
                this.attemptReconnection(token, baseUrl, tokenFactory);
            });
        } catch (e) {
            this.logger.log(`SocketFactory: Error setting up stream: ${e}`);
        }

        this._socketSubject.next(this._socket);
    }

    /**
     * TODO: pass new token as part of stream to update consumers
     * TODO: refresh client state when new socket returned
     * @param token
     * @param baseUrl
     * @param tokenFactory
     */
    private attemptReconnection(
        token: IAuthToken,
        baseUrl: string,
        tokenFactory: (token: IAuthToken) => Promise<IAuthToken>,
    ) {
        this.logger.log(`SocketFactory attemptreconnection reconnect timeout: ${this._reconnectTimeout}`);

        this._reconnectSubscription = interval(this._reconnectTimeout)
            .pipe(
                take(1),
                mergeMap(() => tokenFactory(token)),
            )
            .subscribe(
                (refreshedToken) => {
                    this.logger.log(`GarageDoorHttpService: attempting reconnection`);
                    this.createSocket(refreshedToken, baseUrl, tokenFactory);
                },
                (error) => {
                    this.logger.log(`GarageDoorHttpService: reconnection failed: ${printError(error)}`);
                    this._reconnectTimeout = Math.min(maxReconnectDelay, this._reconnectTimeout * 2);
                    this.attemptReconnection(token, baseUrl, tokenFactory);
                },
            );
    }

    private resetReconnection() {
        this._reconnectSubscription?.unsubscribe();
        this._reconnectTimeout = initialReconnectDelay;
        this._reconnectSubscription = undefined;
    }
}
