import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { compareSync } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { IUser, IAuthToken, IRefreshToken, IUserToken } from '../../../shared';
import { randomBytes } from 'crypto';
import { jwtConstants } from './constants';
import { join } from 'path';
import { existsSync, promises } from 'fs';
import { verify } from 'jsonwebtoken';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService) {}

    public validateToken(token?: string) {
        if (token == null) {
            console.warn(`AuthService.validateToken: no token supplied`);
            return undefined;
        }

        try {
            return verify(token, jwtConstants.secret);
        } catch (e) {
            console.log(`AuthService.validateToken ${token.substr(-5)}: ERROR: ${e}`);
        }
        return undefined;
    }

    async validateUser(username: string, password: string): Promise<IUser | undefined> {
        const user = await this.usersService.findOne(username);

        if (user && compareSync(password, user.hash)) {
            return { username: user.username };
        }

        return undefined;
    }

    async login(user: IUser): Promise<IAuthToken> {
        console.log(`AuthService.login: ${user.username}`);
        const refreshPayload: IRefreshToken = {
            refresh_token: randomBytes(32).toString('hex'),
        };

        await this.storeRefreshToken(user, refreshPayload);

        return {
            access_token: this.jwtService.sign(user),
            refresh_token: this.jwtService.sign(refreshPayload, { expiresIn: jwtConstants.refreshExpiry }),
        };
    }

    private async storeRefreshToken(user: IUser, refreshToken: IRefreshToken) {
        const tokensPath = join(__dirname, '../../../../', 'userTokens.json');
        let tokens: IUserToken[] = [];

        if (existsSync(tokensPath)) {
            console.log(`Loading existing tokens from '${tokensPath}'`);

            tokens = JSON.parse((await promises.readFile(tokensPath)).toString());
            tokens = tokens.filter((token) => token.username != user.username);
        }

        tokens.push({ ...user, ...refreshToken });

        console.log(`Writing tokens file to: '${tokensPath}'`);
        await promises.writeFile(tokensPath, JSON.stringify(tokens, undefined, 4));
    }
}
