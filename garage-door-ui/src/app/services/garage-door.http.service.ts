import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IGarageDoorStatus, UPDATE_DOOR_STATUS, IStatusChangeImage } from '../../../../shared';
import io from 'socket.io-client';
import { DOOR_STATUS_UPDATES } from '../../../../shared';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';
import { AuthTokenService } from './auth-token.service';

@Injectable()
export class GarageDoorHttpService {
    private _socket: SocketIOClient.Socket | undefined;
    private updatesSubject = new Subject<IGarageDoorStatus>();

    constructor(private http: HttpClient, private authTokenService: AuthTokenService) {
        authTokenService.tokenStream.subscribe(() => this.onNewToken());
    }

    public getLatestImage() {
        return this.http.get<IStatusChangeImage[]>('api/garage/image?maxCount=1');
    }

    public getImages(before: number) {
        return this.http.get<IStatusChangeImage[]>(`api/garage/image?maxCount=5&before=${before}`);
    }

    public takePicture() {
        return this.http.get<IStatusChangeImage>(`api/garage/image/newImage`);
    }

    public loadStatus() {
        return this.http.get<IGarageDoorStatus>('api/garage/door');
    }

    public openDoor() {
        return this.setGarageState('OPEN');
    }

    public closeDoor() {
        return this.setGarageState('CLOSED');
    }

    public statusUpdatesStream() {
        this.createSocket();

        return this.updatesSubject;
    }

    private onNewToken() {
        this.createSocket(true);
    }

    private createSocket(force = false) {
        if (this._socket != null && !force) {
            return;
        }

        if (this._socket) {
            this._socket.close();
        }

        let url = environment.updatesUrl;
        if (this.authTokenService.authToken != null) {
            url = `${url}?token=${this.authTokenService.authToken.access_token}`;
        }

        try {
            const socket = io(url);
            this._socket = socket;

            socket.on('connect', () => {
                console.log(`GarageDoorHttpService statusUpdatesStream: SOCKET CONNECTED`);
            });

            socket.on(DOOR_STATUS_UPDATES, (update: IGarageDoorStatus) => this.updatesSubject.next(update));

            socket.on('disconnect ', () => console.log(`GarageDoorHttpService statusUpdatesStream: disconnect`));
            socket.on('error', (error: any) =>
                console.log(`GarageDoorHttpService statusUpdatesStream: Error from stream: ${error}`),
            );
        } catch (e) {
            console.log(`GarageDoorHttpService statusUpdatesStream: Error setting up stream: ${e}`);
        }
    }

    private setGarageState(status: UPDATE_DOOR_STATUS) {
        const payload: IGarageDoorStatus<UPDATE_DOOR_STATUS> = {
            status,
        };

        return this.http.put<IGarageDoorStatus>('api/garage/door', payload);
    }
}
