import { IGarageDoorStatus, UPDATE_DOOR_STATUS, IGarageDoorOptions, DOOR_STATUS } from '../contracts';
import { AsyncIterableServiceFactory, AsyncIterableService } from './async-iterable.service';
import gpio from 'rpi-gpio';
import { combineLatest, from, Observable, fromEvent } from 'rxjs';
import { take, map, tap, delay, mergeMap } from 'rxjs/operators';
import { getStatus } from '../helpers/status-helper';

function unsupportedWrite(state: never): IGarageDoorStatus {
    throw new Error(`Could not set door status to '${state}'`);
}

const defaultOptions: IGarageDoorOptions = {
    buttonPressInterval: 1000,
    pinAddressingMode: 'mode_rpi',
    buttonPressRelayPin: 11,
    doorOpenSwitchPin: 13,
    doorClosedSwitchPin: 15,
    stateChangeDelay: 2000,
};

export class GarageDoorService {
    private readonly _options: IGarageDoorOptions;
    private _status: IGarageDoorStatus | undefined;

    constructor(factory: AsyncIterableServiceFactory<IGarageDoorStatus>, options?: Partial<IGarageDoorOptions>) {
        this.events = factory.create();
        this._options = { ...defaultOptions, ...options };

        gpio.setMode(this._options.pinAddressingMode);
        gpio.setup(this._options.doorOpenSwitchPin, 'in', 'both');
        gpio.setup(this._options.doorClosedSwitchPin, 'in', 'both');
        gpio.setup(this._options.buttonPressRelayPin, 'high');
        fromEvent(gpio, 'change')
            .pipe(
                delay(this._options.stateChangeDelay),
                mergeMap(() => from(this.getState())),
            )
            .subscribe();
    }

    public readonly events: AsyncIterableService<IGarageDoorStatus>;

    public async getState(): Promise<IGarageDoorStatus> {
        return combineLatest(
            this.readPin(this._options.doorOpenSwitchPin),
            this.readPin(this._options.doorClosedSwitchPin),
        )
            .pipe(
                map(([doorOpen, doorClosed]) => getStatus(doorOpen, doorClosed, this._status?.status)),
                map<DOOR_STATUS, IGarageDoorStatus>((status) => ({ status })),
                tap((status) => {
                    if (this._status?.status != status.status) {
                        this.status = status;
                    }
                }),
            )
            .toPromise();
    }

    public setState(value: IGarageDoorStatus<UPDATE_DOOR_STATUS>): IGarageDoorStatus {
        let status: IGarageDoorStatus;
        switch (value.status) {
            case 'OPEN':
                status = { status: 'OPENING' };
                break;

            case 'CLOSED':
                status = { status: 'CLOSING' };
                break;

            default:
                return unsupportedWrite(value.status);
        }

        this.pressButton();

        this.status = status;
        return status;
    }

    private set status(value: IGarageDoorStatus) {
        this._status = value;
        this.events.emit(value);
    }

    private pressButton() {
        return from(gpio.promise.write(this._options.buttonPressRelayPin, false))
            .pipe(
                delay(this._options.buttonPressInterval),
                mergeMap(() => from(gpio.promise.write(this._options.buttonPressRelayPin, true))),
            )
            .toPromise();
    }

    private readPin(pin: number): Observable<boolean> {
        return from(gpio.promise.read(pin) as Promise<boolean>).pipe(take(1));
    }
}
