import { Component } from '@angular/core';
import { GarageDoorHttpService } from '../../../../../shared';
import { Router } from '@angular/router';
import { from } from 'rxjs';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
    constructor(private service: GarageDoorHttpService, private router: Router) {}

    private _error: string | undefined;

    public get error(): string | undefined {
        return this._error;
    }

    public login(username: string, password: string) {
        from(this.service.login(username, password)).subscribe(
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
