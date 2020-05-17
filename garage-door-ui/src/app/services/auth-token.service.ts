import { Injectable } from '@angular/core';

@Injectable()
export class AuthTokenService {
    public authToken: string | undefined;
}
