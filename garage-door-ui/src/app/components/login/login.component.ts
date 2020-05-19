import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IAuthToken } from '../../../../../shared';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
    constructor(private html: HttpClient, private router: Router) {}

    private _error: string | undefined;

    public get error(): string | undefined {
        return this._error;
    }

    public login(username: string, password: string) {
        this.html
            .post<IAuthToken>('api/login', { username, password })
            .subscribe(
                (response) => {
                    this._error = undefined;
                    console.log(`LOGIN received: ${JSON.stringify(response)}`);
                    this.router.navigate(['']);
                },
                (error) => {
                    this._error = error.message;
                    console.log;
                },
            );
    }
}
