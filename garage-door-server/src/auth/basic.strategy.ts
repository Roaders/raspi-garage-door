import { BasicStrategy as PassportBasicStrategy } from 'passport-http';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IUser } from '../../../shared';

@Injectable()
export class BasicStrategy extends PassportStrategy(PassportBasicStrategy, 'basic') {
    constructor(private authService: AuthService) {
        super();
        console.log(`BasicStrategy`);
    }

    async validate(username: string, password: string): Promise<IUser> {
        const user = await this.authService.validateUser(username, password);

        if (!user) {
            throw new UnauthorizedException();
        }

        return user;
    }
}
