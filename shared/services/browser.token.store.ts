import { IAuthToken } from '../contracts';
import { ITokenStore } from '../contracts';

const LOCAL_STORAGE_KEY = `rpi-garage-door.token.store`;

export class BrowserTokenStore implements ITokenStore {
    public get token(): IAuthToken | undefined {
        const rawString = localStorage.getItem(LOCAL_STORAGE_KEY);
        return rawString != null ? JSON.parse(rawString) : undefined;
    }

    public set token(value: IAuthToken | undefined) {
        if (value != null) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(value));
        } else {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
    }
}
