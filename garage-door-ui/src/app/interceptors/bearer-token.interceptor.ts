import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { HttpRequest } from '@angular/common/http';
import { HttpHandler } from '@angular/common/http';
import { HttpEvent } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { AuthTokenService } from '../services/auth-token.service';
import { isAuthResponse } from '../../../../shared';
import { Router } from '@angular/router';

@Injectable()
export class AuthHttpInterceptor implements HttpInterceptor {
    constructor(private authTokenService: AuthTokenService, private router: Router) {}

    intercept<T>(request: HttpRequest<T>, next: HttpHandler): Observable<HttpEvent<T>> {
        let mutatedRequest = request;

        if (this.authTokenService.authToken != null) {
            console.log(`APPENDING TOKEN`);

            const headers = new HttpHeaders({
                Authorization: 'Bearer ' + this.authTokenService.authToken.access_token,
                'Content-Type': 'application/json',
            });

            mutatedRequest = request.clone({ headers });
        } else {
            console.log(`NO TOKEN`);
        }

        return next.handle(mutatedRequest).pipe(
            tap(
                (response) => {
                    if (response instanceof HttpResponse && isAuthResponse(response.body)) {
                        this.authTokenService.authToken = response.body;
                    }
                },
                (error) => {
                    if (error instanceof HttpErrorResponse) {
                        if (error.status !== 401) {
                            return;
                        }
                        console.log(`NAVIGATING`);
                        this.router.navigate(['login']);
                    }
                },
            ),
        );
    }
}
