import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IGarageDoorStatus, writeStatus } from '../../../../rpi-garage-door/src';
import { Socket } from 'ngx-socket-io';
import { DOOR_STATUS_UPDATES } from '../../../../shared';

@Injectable()
export class GarageDoorHttpService {
    constructor(private http: HttpClient, private socket: Socket) {}

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
        return this.socket.fromEvent<IGarageDoorStatus>(DOOR_STATUS_UPDATES);
    }

    private setGarageState(status: writeStatus) {
        const payload: IGarageDoorStatus<writeStatus> = {
            status,
        };

        return this.http.put<IGarageDoorStatus>('api/garage/door', payload);
    }
}
