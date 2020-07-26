import { Injectable } from '@angular/core';
import { Subject, Observable, from, Subscriber } from 'rxjs';
import { AuthTokenService } from './auth-token.service';
import { shareReplay, tap, map, catchError, mergeMap } from 'rxjs/operators';
import axios, { AxiosResponse } from 'axios';
import { IGarageDoorStatus, IStatusChangeImage, IAuthToken, UPDATE_DOOR_STATUS } from '../contracts';
import { DOOR_STATUS_UPDATES, DOOR_IMAGE_UPDATES } from '../constants';
import { SocketFactory } from '../socket-factory';
import { createAxiosConfig } from '../helpers';

@Injectable()
export class GarageDoorHttpService {
    private doorStatusSubject = new Subject<IGarageDoorStatus>();
    private doorStatusObservable: Observable<IGarageDoorStatus> | undefined;
    private doorImageSubject = new Subject<IStatusChangeImage>();
    private doorImageObservable: Observable<IStatusChangeImage> | undefined;
    private exchangeTokenStream: Observable<IAuthToken> | undefined;
    private initialSocketCreated = false;

    constructor(private authTokenService: AuthTokenService, private socketFactory: SocketFactory) {
        authTokenService.tokenStream.subscribe(() => this.onNewToken());

        socketFactory.socketStream.subscribe((socket) => {
            console.log(`INITIAL SOCKET`);
            this.initialSocketCreated = true;
            socket.on(DOOR_STATUS_UPDATES, (update: IGarageDoorStatus) => this.doorStatusSubject.next(update));
            socket.on(DOOR_IMAGE_UPDATES, (update: IStatusChangeImage) => this.doorImageSubject.next(update));

            if (this.doorStatusSubject.observers.length > 0) {
                this.updateDoorStatus();
            } else {
                console.log(`No doorStatusSubject subscribers, not updating status`);
            }
            if (this.doorImageSubject.observers.length > 0) {
                this.updateImagesStatus();
            } else {
                console.log(`No doorImageSubject subscribers, not updating status`);
            }
        });
    }

    public baseUrl: string | undefined;

    public getLatestImage() {
        return this.wrapPromise(() =>
            axios.get<IStatusChangeImage[]>(this.buildUrl('api/garage/image?maxCount=1'), this.createConfig()),
        );
    }

    public getImages(before: number) {
        return this.wrapPromise(() =>
            axios.get<IStatusChangeImage[]>(
                this.buildUrl(`api/garage/image?maxCount=5&before=${before}`),
                this.createConfig(),
            ),
        );
    }

    public takePicture() {
        return this.wrapPromise(() =>
            axios.get<IStatusChangeImage>(this.buildUrl('api/garage/image/newImage'), this.createConfig()),
        );
    }

    public loadStatus() {
        return this.wrapPromise(() =>
            axios.get<IGarageDoorStatus>(this.buildUrl('api/garage/door'), this.createConfig()),
        );
    }

    public openDoor() {
        return this.setGarageState(`OPEN`);
    }

    public closeDoor() {
        return this.setGarageState(`CLOSED`);
    }

    public setGarageState(status: UPDATE_DOOR_STATUS) {
        const payload: IGarageDoorStatus<UPDATE_DOOR_STATUS> = {
            status,
        };

        return this.wrapPromise(() =>
            axios.put<IGarageDoorStatus>(this.buildUrl('api/garage/door'), payload, this.createConfig()),
        );
    }

    public statusUpdatesStream() {
        this.createSocket();

        if (this.doorStatusObservable == null) {
            this.doorStatusObservable = new Observable((subscriber: Subscriber<IGarageDoorStatus>) => {
                console.log(`doorStatusObservable subscription`);
                if (this.initialSocketCreated) {
                    console.log(`statusUpdatesStream this.initialSocketCreated => updateImagesStatus`);
                    this.updateDoorStatus();
                }
                return this.doorStatusSubject.subscribe(subscriber);
            });
        }

        return this.doorStatusObservable;
    }

    public imageUpdatesStream() {
        this.createSocket();

        if (this.doorImageObservable == null) {
            this.doorImageObservable = new Observable((subscriber: Subscriber<IStatusChangeImage>) => {
                console.log(`doorImageObservable subscription`);
                if (this.initialSocketCreated) {
                    console.log(`imageUpdatesStream this.initialSocketCreated => updateImagesStatus`);
                    this.updateImagesStatus();
                }
                return this.doorImageSubject.subscribe(subscriber);
            });
        }

        return this.doorImageObservable;
    }

    public login(username: string, password: string) {
        return from(
            axios.post<IAuthToken>(this.buildUrl('api/login'), { username, password }),
        )
            .pipe(
                map((response) => response.data),
                tap((token) => (this.authTokenService.authToken = token)),
            )
            .toPromise();
    }

    private buildUrl(path: string): string {
        if (this.baseUrl == null) {
            return path;
        }

        return `${this.baseUrl}/${path}`;
    }

    public exchangeToken(): Promise<IAuthToken> {
        if (this.exchangeTokenStream != null) {
            return this.exchangeTokenStream.toPromise();
        }

        this.exchangeTokenStream = from(
            axios.get<IAuthToken>(
                this.buildUrl('api/exchangeToken'),
                createAxiosConfig(this.authTokenService.authToken?.refresh_token),
            ),
        ).pipe(
            map((response) => response.data),
            tap(
                (token) => {
                    this.exchangeTokenStream = undefined;
                    this.authTokenService.authToken = token;
                },
                () => (this.exchangeTokenStream = undefined),
            ),
            shareReplay(1),
        );

        return this.exchangeTokenStream.toPromise();
    }

    private onNewToken() {
        this.createSocket();
    }

    private wrapPromise<T>(promiseFactory: () => Promise<AxiosResponse<T>>) {
        return from(promiseFactory())
            .pipe(
                catchError(() => from(this.exchangeToken()).pipe(mergeMap(() => promiseFactory()))),
                map((response) => response.data),
            )
            .toPromise();
    }

    private createSocket() {
        if (this.authTokenService.authToken == null) {
            return;
        }

        this.socketFactory.createSocket(() => this.exchangeToken(), this.authTokenService.authToken);
    }

    private createConfig() {
        return createAxiosConfig(this.authTokenService.authToken?.access_token);
    }

    private updateDoorStatus() {
        from(this.loadStatus()).subscribe((status) => this.doorStatusSubject.next(status));
    }

    private updateImagesStatus() {
        from(this.getLatestImage()).subscribe((images) => images.forEach((image) => this.doorImageSubject.next(image)));
    }
}
