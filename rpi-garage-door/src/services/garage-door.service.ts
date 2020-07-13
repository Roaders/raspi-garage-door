import { IGarageDoorStatus, UPDATE_DOOR_STATUS, DOOR_STATUS } from '../../../shared';
import { AsyncIterableServiceFactory, AsyncIterableService } from './async-iterable.service';
import gpio from 'rpi-gpio';
import { combineLatest, from, Observable, fromEvent } from 'rxjs';
import { take, map, tap, delay, mergeMap } from 'rxjs/operators';
import { getStatus } from '../helpers/status-helper';
import { IGarageDoorOptions } from '../contracts';

function unsupportedWrite(state: never): IGarageDoorStatus {
    throw new Error(`Could not set door status to '${state}'`);
}

const defaultOptions: IGarageDoorOptions = {
    buttonPressInterval: 1000,
    pinAddressingMode: 'mode_rpi',
    buttonPressRelayPin: 11,
    openButtonPressRelayPin: 12,
    twoButtonMode: true,
    doorOpenSwitchPin: 13,
    doorClosedSwitchPin: 15,
    stateChangeDelay: 2000,
    invertRelayControl: false,
};

export class GarageDoorService {
    private readonly _options: IGarageDoorOptions;
    private _status: IGarageDoorStatus | undefined;

    constructor(factory: AsyncIterableServiceFactory<IGarageDoorStatus>, options?: Partial<IGarageDoorOptions>) {
        this.events = factory.create();
        this._options = { ...defaultOptions, ...options };

        gpio.setMode(this._options.pinAddressingMode);
        const openPinPromise = gpio.promise.setup(this._options.doorOpenSwitchPin, 'in', 'both');
        const closePinPromise = gpio.promise.setup(this._options.doorClosedSwitchPin, 'in', 'both');
        gpio.setup(this._options.buttonPressRelayPin, this._options.invertRelayControl ? 'high' : 'low');
        if (this._options.twoButtonMode) {
            gpio.setup(this._options.openButtonPressRelayPin, this._options.invertRelayControl ? 'high' : 'low');
        }

        fromEvent(gpio, 'change')
            .pipe(
                delay(this._options.stateChangeDelay),
                mergeMap(() => this.onStatusUpdate()),
            )
            .subscribe();

        combineLatest(openPinPromise, closePinPromise)
            .pipe(mergeMap(() => from(this.getState())))
            .subscribe((state) => {
                this._status = state;
            });
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

        if (this._status?.status != 'OPENING' && this._status?.status != 'CLOSING') {
            this.pressButton(value.status);
        }

        this.status = status;
        return status;
    }

    private onStatusUpdate() {
        return from(this.getState()).pipe(
            tap((status) => {
                if (this._status?.status != status.status) {
                    if (this._status?.status === 'OPENING' && status.status === 'CLOSED') {
                        this.pressButton('OPEN');
                    } else if (this._status?.status === 'CLOSING' && status.status === 'OPEN') {
                        this.pressButton('CLOSED');
                    } else {
                        this.status = status;
                    }
                }
            }),
        );
    }

    private set status(value: IGarageDoorStatus) {
        this._status = value;
        this.events.emit(value);
    }

    private pressButton(value: UPDATE_DOOR_STATUS) {
        const targetPin =
            this._options.twoButtonMode && value === 'OPEN'
                ? this._options.openButtonPressRelayPin
                : this._options.buttonPressRelayPin;

        // Set relay to on
        return from(gpio.promise.write(targetPin, !this._options.invertRelayControl))
            .pipe(
                // wait for delay
                delay(this._options.buttonPressInterval),
                //set relay to off
                mergeMap(() => from(gpio.promise.write(targetPin, this._options.invertRelayControl))),
            )
            .toPromise();
    }

    private readPin(pin: number): Observable<boolean> {
        return from(gpio.promise.read(pin) as Promise<boolean>).pipe(take(1));
    }
}
