import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';
import { IUser, IRefreshToken, isIUser } from '../../../shared';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private userService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConstants.secret,
        });
    }

    async validate(payload: IUser | IRefreshToken): Promise<IUser | undefined> {
        console.log(`JWT Validate: ${JSON.stringify(payload)}`);

        const user = isIUser(payload) ? payload : await this.userService.findFromRefreshToken(payload.refresh_token);

        return user ? { username: user.username } : undefined;
    }
}
