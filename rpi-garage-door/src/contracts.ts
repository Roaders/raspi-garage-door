export type writeStatus = 'OPEN' | 'CLOSED';
export type status = writeStatus | 'OPENING' | 'CLOSING' | 'UNKNOWN';

export interface IGarageDoorStatus<T extends writeStatus | status = status> {
    readonly status: T;
}
