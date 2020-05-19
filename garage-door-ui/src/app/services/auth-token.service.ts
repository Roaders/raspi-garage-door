import { Injectable } from '@angular/core';
import { IAuthToken } from '../../../../shared';

@Injectable()
export class AuthTokenService {
    public authToken: IAuthToken | undefined;
}
