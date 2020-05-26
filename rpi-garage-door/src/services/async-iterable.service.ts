export class AsyncIterableService<T> implements AsyncIterable<T> {
    private _resolveFunction: ((value: IteratorYieldResult<T>) => void) | undefined;
    private _nextPromise: Promise<IteratorResult<T>> | undefined;

    [Symbol.asyncIterator](): AsyncIterator<T> {
        console.log(`setup up async iterator`);
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

    public emit(value: T, done?: false) {
        if (this._resolveFunction != null) {
            this._resolveFunction({ value, done });

            this._nextPromise = undefined;
            this._resolveFunction = undefined;
        }
    }
}

export class AsyncIterableServiceFactory<T> {
    create() {
        return new AsyncIterableService<T>();
    }
}
