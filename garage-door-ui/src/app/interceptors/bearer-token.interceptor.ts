import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpInterceptor } from '@angular/common/http';
import { HttpRequest } from '@angular/common/http';
import { HttpHandler } from '@angular/common/http';
import { HttpEvent } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { AuthTokenService } from '../services/auth-token.service';

@Injectable()
export class AuthHttpInterceptor implements HttpInterceptor {
    constructor(private authTokenService: AuthTokenService) {}

    intercept<T>(request: HttpRequest<T>, next: HttpHandler): Observable<HttpEvent<T>> {
        let mutatedRequest = request;

        if (this.authTokenService.authToken != null) {
            console.log(`APPENDING TOKEN`);

            const headers = new HttpHeaders({
                Authorization: 'Bearer ' + this.authTokenService.authToken,
                'Content-Type': 'application/json',
            });

            mutatedRequest = request.clone({ headers });
        } else {
            console.log(`NO TOKEN`);
        }

        return next.handle(mutatedRequest);
    }
}
