import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthTokenService } from './auth-token.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private tokenService: AuthTokenService, private router: Router) {}

    canActivate(): boolean {
        if (this.tokenService.authToken != null) {
            return true;
        } else {
            this.router.navigate(['login']);

            return false;
        }
    }
}
