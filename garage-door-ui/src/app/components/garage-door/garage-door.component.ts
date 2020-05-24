import { Component, OnInit } from '@angular/core';
import { IGarageDoorStatus } from '../../../../../rpi-garage-door/src';
import { GarageDoorHttpService } from 'src/app/services';

@Component({
    selector: 'garage-door',
    templateUrl: './garage-door.component.html',
    styleUrls: ['./garage-door.component.scss'],
})
export class GarageDoorComponent implements OnInit {
    constructor(private service: GarageDoorHttpService) {}

    private _statusError: string | undefined;

    public get statusError(): string | undefined {
        return this._statusError;
    }

    public get showStatus(): boolean {
        return this._status != null && this._statusError == null;
    }

    public get isLoading(): boolean {
        return this._status == null && this._statusError == null;
    }

    public get canOpen(): boolean {
        return this._status?.status != 'OPEN';
    }

    public get canClose(): boolean {
        return this._status?.status != 'CLOSED';
    }

    private _status: IGarageDoorStatus | undefined;

    public get statusString(): string | undefined {
        if (this._status == null) {
            return undefined;
        }

        switch (this._status.status) {
            case 'CLOSED':
                return `Closed`;
            case 'CLOSING':
                return `Closing...`;
            case 'OPEN':
                return `Open`;
            case 'OPENING':
                return `Opening...`;

            default:
                return 'Unknown';
        }
    }

    public openDoor() {
        this.reset();
        this.service.openDoor().subscribe(this.onStatus.bind(this), this.onError.bind(this));
    }

    public closeDoor() {
        this.reset();
        this.service.closeDoor().subscribe(this.onStatus.bind(this), this.onError.bind(this));
    }

    public ngOnInit(): void {
        this.service.statusUpdatesStream().subscribe(this.onStatus.bind(this));
        this.loadStatus();
    }

    public loadStatus() {
        this.service.loadStatus().subscribe(this.onStatus.bind(this), this.onError.bind(this));
    }

    private reset() {
        this._statusError = undefined;
        this._status = undefined;
    }

    private onStatus(status: IGarageDoorStatus) {
        this._status = status;
        this._statusError = undefined;
    }

    private onError(error: any) {
        this._status = undefined;
        this._statusError = error.message;
    }
}
