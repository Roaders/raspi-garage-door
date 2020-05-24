import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IGarageDoorStatus, writeStatus } from '../../../../rpi-garage-door/src';
import io from 'socket.io-client';

@Injectable()
export class GarageDoorHttpService {
    constructor(private http: HttpClient) {}

    private _socket: SocketIOClient.Socket | undefined;

    public loadStatus() {
        return this.http.get<IGarageDoorStatus>('api/garage/door');
    }

    public openDoor() {
        return this.setGarageState('OPEN');
    }

    public closeDoor() {
        return this.setGarageState('CLOSED');
    }

    public subscribeToPushMessages() {
        console.log(`subscribeToPushMessages`);
        this._socket = io('http://localhost:3000');
    }

    private setGarageState(status: writeStatus) {
        const payload: IGarageDoorStatus<writeStatus> = {
            status,
        };

        return this.http.put<IGarageDoorStatus>('api/garage/door', payload);
    }
}
