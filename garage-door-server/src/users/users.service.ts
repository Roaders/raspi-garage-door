import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { existsSync, promises } from 'fs';
import chalk from 'chalk';
import { IUserAuth, IUser, IUserToken } from '../../../shared';

@Injectable()
export class UsersService {
    public async findOne(username: string): Promise<IUserAuth | undefined> {
        const usersPath = join(__dirname, '../../../../', 'users.json');

        let users: IUserAuth[];

        if (existsSync(usersPath)) {
            console.log(`Loading users from '${usersPath}'`);

            users = JSON.parse((await promises.readFile(usersPath)).toString());
        } else {
            console.log(chalk.red(`Users file not found. Exiting.`));
            return;
        }

        return users.filter((user) => user.username === username)[0];
    }

    public async findFromRefreshToken(refreshToken: string): Promise<IUser | undefined> {
        const tokensPath = join(__dirname, '../../../../', 'userTokens.json');

        let tokens: IUserToken[];

        if (existsSync(tokensPath)) {
            tokens = JSON.parse((await promises.readFile(tokensPath)).toString());
        } else {
            console.log(chalk.red(`findFromRefreshToken: Tokens file not found. Exiting.`));
            return;
        }

        const user: IUser | undefined = tokens
            .filter((token) => token.refresh_token === refreshToken)
            .map((token) => ({ username: token.username }))[0];

        console.log(`findFromRefreshToken: ${refreshToken.substr(-5)} user found: ${user?.username}`);

        return user;
    }
}
