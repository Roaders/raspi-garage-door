import { Injectable, Inject } from '@angular/core';
import { Subject, Observable, from } from 'rxjs';
import { AuthTokenService } from './auth-token.service';
import { shareReplay, tap, map, catchError, mergeMap } from 'rxjs/operators';
import axios, { AxiosResponse } from 'axios';
import { IGarageDoorStatus, IStatusChangeImage, IAuthToken, UPDATE_DOOR_STATUS } from '../contracts';
import { DOOR_STATUS_UPDATES, DOOR_IMAGE_UPDATES } from '../constants';
import { SocketFactory } from '../socket-factory';
import { createAxiosConfig } from '../helpers';

export const exchangeUrl = 'api/exchangeToken';

@Injectable()
export class GarageDoorHttpService {
    private doorStatusSubject = new Subject<IGarageDoorStatus>();
    private doorImageSubject = new Subject<IStatusChangeImage>();
    private exchangeTokenStream: Observable<IAuthToken> | undefined;

    constructor(
        private authTokenService: AuthTokenService,
        private socketFactory: SocketFactory,
        @Inject('updatesUrl') private updatesUrl: string,
    ) {
        authTokenService.tokenStream.subscribe(() => this.onNewToken());

        socketFactory.socketStream.subscribe((socket) => {
            socket.on(DOOR_STATUS_UPDATES, (update: IGarageDoorStatus) => this.doorStatusSubject.next(update));
            socket.on(DOOR_IMAGE_UPDATES, (update: IStatusChangeImage) => this.doorImageSubject.next(update));
        });
    }

    public getLatestImage() {
        return this.wrapPromise(() =>
            axios.get<IStatusChangeImage[]>('api/garage/image?maxCount=1', this.createConfig()),
        );
    }

    public getImages(before: number) {
        return this.wrapPromise(() =>
            axios.get<IStatusChangeImage[]>(`api/garage/image?maxCount=5&before=${before}`, this.createConfig()),
        );
    }

    public takePicture() {
        return this.wrapPromise(() => axios.get<IStatusChangeImage>(`api/garage/image/newImage`, this.createConfig()));
    }

    public loadStatus() {
        return this.wrapPromise(() => axios.get<IGarageDoorStatus>('api/garage/door', this.createConfig()));
    }

    public openDoor() {
        return this.setGarageState('OPEN');
    }

    public closeDoor() {
        return this.setGarageState('CLOSED');
    }

    public statusUpdatesStream() {
        this.createSocket();

        return this.doorStatusSubject;
    }

    public imageUpdatesStream() {
        this.createSocket();

        return this.doorImageSubject;
    }

    public login(username: string, password: string) {
        return from(
            axios.post<IAuthToken>('api/login', { username, password }),
        )
            .pipe(
                map((response) => response.data),
                tap((token) => (this.authTokenService.authToken = token)),
            )
            .toPromise();
    }

    private exchangeToken(): Observable<IAuthToken> {
        if (this.exchangeTokenStream != null) {
            return this.exchangeTokenStream;
        }

        this.exchangeTokenStream = from(
            axios.get<IAuthToken>(exchangeUrl, createAxiosConfig(this.authTokenService.authToken?.refresh_token)),
        ).pipe(
            map((response) => response.data),
            tap((token) => {
                this.exchangeTokenStream = undefined;
                this.authTokenService.authToken = token;
            }),
            shareReplay(1),
        );

        return this.exchangeTokenStream;
    }

    private onNewToken() {
        this.createSocket();
    }

    private wrapPromise<T>(promiseFactory: () => Promise<AxiosResponse<T>>) {
        return from(promiseFactory())
            .pipe(
                catchError(() => this.exchangeToken().pipe(mergeMap(() => promiseFactory()))),
                map((response) => response.data),
            )
            .toPromise();
    }

    private createSocket() {
        if (this.authTokenService.authToken == null) {
            return;
        }

        this.socketFactory.createSocket(this.authTokenService.authToken, this.updatesUrl, () =>
            this.exchangeToken().toPromise(),
        );
    }

    private setGarageState(status: UPDATE_DOOR_STATUS) {
        const payload: IGarageDoorStatus<UPDATE_DOOR_STATUS> = {
            status,
        };

        return this.wrapPromise(() => axios.put<IGarageDoorStatus>('api/garage/door', payload, this.createConfig()));
    }

    private createConfig() {
        return createAxiosConfig(this.authTokenService.authToken?.access_token);
    }
}
