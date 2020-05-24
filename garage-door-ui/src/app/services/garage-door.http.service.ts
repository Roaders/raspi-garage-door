import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IGarageDoorStatus, writeStatus } from '../../../../rpi-garage-door/src';

@Injectable()
export class GarageDoorHttpService {
    constructor(private http: HttpClient) {}

    public loadStatus() {
        return this.http.get<IGarageDoorStatus>('api/garage/door');
    }

    public openDoor() {
        return this.setGarageState('OPEN');
    }

    public closeDoor() {
        return this.setGarageState('CLOSED');
    }

    private setGarageState(status: writeStatus) {
        const payload: IGarageDoorStatus<writeStatus> = {
            status,
        };

        return this.http.put<IGarageDoorStatus>('api/garage/door', payload);
    }
}
