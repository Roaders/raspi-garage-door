import { IGarageDoorStatus, writeStatus, IGarageDoorOptions } from '../contracts';
import { AsyncIterableServiceFactory, AsyncIterableService } from './async-iterable.service';
import gpio from 'rpi-gpio';

function unsupportedWrite(state: never): IGarageDoorStatus {
    throw new Error(`Could not set door status to '${state}'`);
}

const defaultOptions: IGarageDoorOptions = {
    buttonPressInterval: 1000,
    pinAddressingMode: 'mode_rpi',
    buttonPressRelayPin: 11,
    doorOpenSwitchPin: 13,
    doorClosedSwitchPin: 15,
    stateChangeDelay: 1000,
};

export class GarageDoorService {
    private readonly _options: IGarageDoorOptions;
    private _status: IGarageDoorStatus | undefined;

    constructor(factory: AsyncIterableServiceFactory<IGarageDoorStatus>, options?: Partial<IGarageDoorOptions>) {
        this.events = factory.create();
        this._options = { ...defaultOptions, ...options };

        gpio.setMode(this._options.pinAddressingMode);
    }

    public readonly events: AsyncIterableService<IGarageDoorStatus>;

    public async getState(): Promise<IGarageDoorStatus> {
        this._status = this._status || { status: 'UNKNOWN' };

        return this._status;
    }

    public setState(value: IGarageDoorStatus<writeStatus>): IGarageDoorStatus {
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

        setTimeout(() => (this.status = value), Math.random() * 5000);

        this.status = status;
        return status;
    }

    private set status(value: IGarageDoorStatus) {
        this._status = value;
        this.events.emit(value);
    }
}
