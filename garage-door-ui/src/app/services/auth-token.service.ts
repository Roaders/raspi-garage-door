import { Injectable } from '@angular/core';
import { IAuthToken } from '../../../../shared';

const LOCAL_STORAGE_KEY = `rpi-garage-door.token.store`;

@Injectable()
export class AuthTokenService {
    public get authToken(): IAuthToken | undefined {
        const rawString = localStorage.getItem(LOCAL_STORAGE_KEY);
        return rawString != null ? JSON.parse(rawString) : undefined;
    }

    public set authToken(value: IAuthToken | undefined) {
        if (value != null) {
            console.log(`Updating auth token`);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(value));
        } else {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
    }
}
