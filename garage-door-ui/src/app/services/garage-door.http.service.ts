import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IGarageDoorStatus, writeStatus } from '../../../../rpi-garage-door/src';
import io from 'socket.io-client';
import { DOOR_STATUS_UPDATES } from '../../../../shared';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';
import { AuthTokenService } from './auth-token.service';

@Injectable()
export class GarageDoorHttpService {
    private _socket: SocketIOClient.Socket | undefined;
    private updatesSubject = new Subject<IGarageDoorStatus>();

    constructor(private http: HttpClient, private authTokenService: AuthTokenService) {}

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
        let socket = this._socket;
        if (socket == null) {
            let url = environment.updatesUrl;
            if (this.authTokenService.authToken != null) {
                url = `${url}?token=${this.authTokenService.authToken.access_token}`;
            }
            socket = io(url);
            this._socket = socket;

            socket.on(DOOR_STATUS_UPDATES, (update: IGarageDoorStatus) => this.updatesSubject.next(update));
        }

        return this.updatesSubject;
    }

    private setGarageState(status: writeStatus) {
        const payload: IGarageDoorStatus<writeStatus> = {
            status,
        };

        return this.http.put<IGarageDoorStatus>('api/garage/door', payload);
    }
}
