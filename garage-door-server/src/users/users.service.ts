import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import chalk from 'chalk';
import { IUserAuth } from '../../../shared';

@Injectable()
export class UsersService {
    public async findOne(username: string): Promise<IUserAuth | undefined> {
        const usersPath = join(__dirname, '../../../../', 'users.json');

        let users: IUserAuth[];

        if (existsSync(usersPath)) {
            console.log(`Loading users from '${usersPath}'`);

            users = JSON.parse(readFileSync(usersPath).toString());
        } else {
            console.log(chalk.red(`Users file not found. Exiting.`));
            return;
        }

        return users.filter((user) => user.username === username)[0];
    }
}
