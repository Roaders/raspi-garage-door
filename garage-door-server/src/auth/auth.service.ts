import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { compareSync } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { IUser, IAuthToken } from '../../../shared';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService) {}

    async validateUser(username: string, password: string): Promise<IUser | undefined> {
        const user = await this.usersService.findOne(username);

        if (user && compareSync(password, user.hash)) {
            return { username: user.username };
        }

        return undefined;
    }

    async login(user: IUser): Promise<IAuthToken> {
        return {
            access_token: this.jwtService.sign(user),
            refresh_token: this.jwtService.sign(user, { expiresIn: '60s' }),
        };
    }
}
