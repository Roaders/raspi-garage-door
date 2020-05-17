import prompts from 'prompts';
import chalk from 'chalk';
import { genSaltSync, hashSync } from 'bcryptjs';
import { join } from 'path';
import { IUser } from '../shared';
import { existsSync, readFileSync, writeFileSync } from 'fs';

console.log(`Create new user:`);

async function createUser() {
    const responses = await prompts([
        { name: 'username', type: 'text', message: 'Username:' },
        { name: 'password', type: 'password', message: 'Password:' },
        { name: 'passwordCheck', type: 'password', message: 'Password Again:' },
    ]);

    if (responses.password !== responses.passwordCheck) {
        console.log(chalk.red(`Passwords do not match. Exiting.`));
        return;
    }

    const salt = genSaltSync(10);
    const hash = hashSync(responses.password, salt);

    const usersPath = join(process.cwd(), 'users.json');
    let users: IUser[] = [];

    if (existsSync(usersPath)) {
        console.log(`Loading existing users from '${usersPath}'`);

        users = JSON.parse(readFileSync(usersPath).toString());
    }

    users.push({ username: responses.username, hash, salt });

    console.log(`Writing users file to: '${usersPath}'`);
    writeFileSync(usersPath, JSON.stringify(users, undefined, 4));
}

createUser();
