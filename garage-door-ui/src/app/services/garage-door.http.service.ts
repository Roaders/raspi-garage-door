import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    IGarageDoorStatus,
    UPDATE_DOOR_STATUS,
    IStatusChangeImage,
    DOOR_IMAGE_UPDATES,
    SocketFactory,
    IAuthToken,
} from '../../../../shared';
import { DOOR_STATUS_UPDATES } from '../../../../shared';
import { environment } from '../../environments/environment';
import { Subject, Observable } from 'rxjs';
import { AuthTokenService } from './auth-token.service';
import { shareReplay, tap } from 'rxjs/operators';

export const exchangeUrl = 'api/exchangeToken';

@Injectable()
export class GarageDoorHttpService {
    private doorStatusSubject = new Subject<IGarageDoorStatus>();
    private doorImageSubject = new Subject<IStatusChangeImage>();
    private exchangeTokenStream: Observable<IAuthToken> | undefined;

    constructor(
        private http: HttpClient,
        private authTokenService: AuthTokenService,
        private socketFactory: SocketFactory,
    ) {
        authTokenService.tokenStream.subscribe(() => this.onNewToken());

        socketFactory.socketStream.subscribe((socket) => {
            socket.on(DOOR_STATUS_UPDATES, (update: IGarageDoorStatus) => this.doorStatusSubject.next(update));
            socket.on(DOOR_IMAGE_UPDATES, (update: IStatusChangeImage) => this.doorImageSubject.next(update));
        });
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

    public exchangeToken(): Observable<IAuthToken> {
        if (this.exchangeTokenStream != null) {
            return this.exchangeTokenStream;
        }

        this.exchangeTokenStream = this.http.get<IAuthToken>(exchangeUrl).pipe(
            tap(() => {
                this.exchangeTokenStream = undefined;
            }),
            shareReplay(1),
        );
        return this.exchangeTokenStream;
    }

    public statusUpdatesStream() {
        this.createSocket();

        return this.doorStatusSubject;
    }

    public imageUpdatesStream() {
        this.createSocket();

        return this.doorImageSubject;
    }

    private onNewToken() {
        this.createSocket();
    }

    private createSocket() {
        if (this.authTokenService.authToken == null) {
            return;
        }

        this.socketFactory.createSocket(this.authTokenService.authToken, environment.updatesUrl, () =>
            this.exchangeToken().toPromise(),
        );
    }

    private setGarageState(status: UPDATE_DOOR_STATUS) {
        const payload: IGarageDoorStatus<UPDATE_DOOR_STATUS> = {
            status,
        };

        return this.http.put<IGarageDoorStatus>('api/garage/door', payload);
    }
}
