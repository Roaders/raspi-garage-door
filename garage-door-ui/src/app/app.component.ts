import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IAuthResponse } from '../../../shared';
import { AuthTokenService } from './services/auth-token.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    constructor(private html: HttpClient, private tokenService: AuthTokenService) {}

    private _error: string | undefined;

    public get error(): string | undefined {
        return this._error;
    }

    private _token: string | undefined;

    public get token(): string | undefined {
        return this._token;
    }

    private _time: string | undefined;

    public get time(): string {
        return this._time == null ? 'Not Loaded' : this._time;
    }

    public loadTime() {
        this.html.get<{ time: string }>('api/time').subscribe(
            (response) => {
                console.log(`RESPONSE received: ${response.time}`);

                this._time = response.time;
            },
            (error) => {
                this._error = error.message;
                this._token = undefined;
                console.log;
            },
        );
    }

    public login(username: string, password: string) {
        this.html
            .post<IAuthResponse>('api/login', { username, password })
            .subscribe(
                (response) => {
                    this._error = undefined;
                    this._token = response.access_token;
                    this.tokenService.authToken = response.access_token;
                    console.log(`LOGIN received: ${JSON.stringify(response)}`);
                },
                (error) => {
                    this._error = error.message;
                    this._token = undefined;
                    console.log;
                },
            );
    }
}
