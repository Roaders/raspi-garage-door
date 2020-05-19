import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthTokenService } from '../../services/auth-token.service';
import { IAuthResponse } from '../../../../../shared';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
    constructor(private html: HttpClient, private tokenService: AuthTokenService) {}

    private _error: string | undefined;

    public get error(): string | undefined {
        return this._error;
    }

    public login(username: string, password: string) {
        this.html
            .post<IAuthResponse>('api/login', { username, password })
            .subscribe(
                (response) => {
                    this._error = undefined;
                    this.tokenService.authToken = response.access_token;
                    console.log(`LOGIN received: ${JSON.stringify(response)}`);
                },
                (error) => {
                    this._error = error.message;
                    console.log;
                },
            );
    }
}
