import { IGarageDoorStatus, writeStatus } from '../contracts';

function unsupportedWrite(state: never): IGarageDoorStatus {
    throw new Error(`Could not set door status to '${state}'`);
}

export class GarageDoorService implements AsyncIterable<IGarageDoorStatus> {
    private _status: IGarageDoorStatus | undefined;
    private _resolveFunction: ((value: IteratorYieldResult<IGarageDoorStatus>) => void) | undefined;
    private _nextPromise: Promise<IteratorResult<IGarageDoorStatus>> | undefined;

    [Symbol.asyncIterator](): AsyncIterator<IGarageDoorStatus> {
        return {
            next: () => {
                let promise = this._nextPromise;
                if (promise == undefined) {
                    promise = new Promise((resolve) => (this._resolveFunction = resolve));
                    this._nextPromise = promise;
                }
                return promise;
            },
        };
    }

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

        if (this._resolveFunction != null) {
            this._resolveFunction({ value, done: false });

            this._nextPromise = undefined;
            this._resolveFunction = undefined;
        }
    }
}
