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
    constructor(private http: HttpClient, private router: Router) {}

    private _error: string | undefined;

    public get error(): string | undefined {
        return this._error;
    }

    public login(username: string, password: string) {
        this.http
            .post<IAuthToken>('api/login', { username, password })
            .subscribe(
                () => {
                    this._error = undefined;
                    this.router.navigate(['']);
                },
                (error) => {
                    this._error = error.message;
                },
            );
    }
}
