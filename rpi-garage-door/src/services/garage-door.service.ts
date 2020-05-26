import { IGarageDoorStatus, writeStatus } from '../contracts';
import { AsyncIterableServiceFactory, AsyncIterableService } from './async-iterable.service';

function unsupportedWrite(state: never): IGarageDoorStatus {
    throw new Error(`Could not set door status to '${state}'`);
}

export class GarageDoorService {
    constructor(factory: AsyncIterableServiceFactory<IGarageDoorStatus>) {
        this.events = factory.create();
    }

    public readonly events: AsyncIterableService<IGarageDoorStatus>;
    private _status: IGarageDoorStatus | undefined;

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
