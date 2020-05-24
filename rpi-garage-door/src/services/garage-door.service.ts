import { IGarageDoorStatus, writeStatus } from '../contracts';

function unsupportedWrite(state: never): Promise<IGarageDoorStatus> {
    throw new Error(`Could not set door status to '${state}'`);
}

export class GarageDoorService {
    private _status: IGarageDoorStatus | undefined;

    public async getState(): Promise<IGarageDoorStatus> {
        switch (this._status?.status) {
            case 'OPENING':
                this._status = { status: 'OPEN' };
                break;

            case 'CLOSING':
                this._status = { status: 'CLOSED' };
                break;
        }

        this._status = this._status || { status: 'UNKNOWN' };

        return this._status;
    }

    public async setState(state: IGarageDoorStatus<writeStatus>): Promise<IGarageDoorStatus> {
        switch (state.status) {
            case 'OPEN':
                this._status = { status: 'OPENING' };
                break;

            case 'CLOSED':
                this._status = { status: 'CLOSING' };
                break;

            default:
                return unsupportedWrite(state.status);
        }

        return this._status;
    }
}
