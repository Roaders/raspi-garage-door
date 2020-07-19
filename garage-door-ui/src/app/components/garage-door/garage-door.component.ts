import { Component, OnInit } from '@angular/core';
import { GarageDoorHttpService, AuthTokenService } from 'src/app/services';
import { IGarageDoorStatus } from '../../../../../shared';
import { Router } from '@angular/router';
import { getStatusStyle, getLockIcon } from 'src/app/helpers';

@Component({
    selector: 'garage-door',
    templateUrl: './garage-door.component.html',
    styleUrls: ['./garage-door.component.scss'],
})
export class GarageDoorComponent implements OnInit {
    constructor(
        private service: GarageDoorHttpService,
        private tokenService: AuthTokenService,
        private router: Router,
    ) {}

    private _error: string | undefined;

    public get error(): string | undefined {
        return this._error;
    }

    public get showStatus(): boolean {
        return this._status != null;
    }

    public get isLoading(): boolean {
        return this._status == null && this._error == null;
    }

    public get canOpen(): boolean {
        return !this.isLoading && this._status?.status != 'OPEN' && this._status?.status != 'OPENING';
    }

    public get canClose(): boolean {
        return !this.isLoading && this._status?.status != 'CLOSED' && this._status?.status != 'CLOSING';
    }

    public get lockIcon() {
        return getLockIcon(this._status?.status);
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

    public get statusStyle(): string {
        return getStatusStyle(this._status?.status);
    }

    public logout() {
        this.tokenService.authToken = undefined;
        this.router.navigate(['login']);
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
        this.service.statusUpdatesStream().subscribe(
            (event) => this.onStatus(event),
            (error) => console.log(`GarageDoorComponent ngOnInit: Stream Error: ${error}`),
        );
        this.loadStatus();
    }

    public loadStatus() {
        this.service.loadStatus().subscribe(this.onStatus.bind(this), this.onError.bind(this));
    }

    private reset() {
        this._error = undefined;
        this._status = undefined;
    }

    private onStatus(status: IGarageDoorStatus) {
        this._status = status;
        this._error = undefined;
    }

    private onError(error: any) {
        this._status = undefined;
        this._error = error.message;
    }
}
