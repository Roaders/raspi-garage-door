import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IAuthToken } from '../contracts';

const LOCAL_STORAGE_KEY = `rpi-garage-door.token.store`;

@Injectable()
export class AuthTokenService {
    private _tokenStream: Subject<IAuthToken | undefined> = new Subject();

    public get tokenStream() {
        return this._tokenStream;
    }

    public get authToken(): IAuthToken | undefined {
        const rawString = localStorage.getItem(LOCAL_STORAGE_KEY);
        return rawString != null ? JSON.parse(rawString) : undefined;
    }

    public set authToken(value: IAuthToken | undefined) {
        if (value != null) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(value));
        } else {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }

        this.tokenStream.next(value);
    }
}
