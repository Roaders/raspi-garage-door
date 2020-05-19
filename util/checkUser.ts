import prompts from 'prompts';
import { compareSync } from 'bcryptjs';
import { join } from 'path';
import { IUserAuth } from '../shared';
import { existsSync, readFileSync } from 'fs';
import chalk from 'chalk';

console.log(`Check user credentials:`);

function checkCredentials(username: string, password: string) {
    const usersPath = join(process.cwd(), 'users.json');
    let users: IUserAuth[];

    if (existsSync(usersPath)) {
        console.log(`Loading users from '${usersPath}'`);

        users = JSON.parse(readFileSync(usersPath).toString());
    } else {
        return chalk.red(`Users file not found. Exiting.`);
    }

    const user: IUserAuth | undefined = users.filter((user) => user.username === username)[0];

    if (user == null) {
        return false;
    }

    return compareSync(password, user.hash);
}

async function validateUser() {
    const { username, password } = await prompts([
        { name: 'username', type: 'text', message: 'Username:' },
        { name: 'password', type: 'password', message: 'Password:' },
    ]);

    const result = checkCredentials(username, password);

    if (typeof result === 'string') {
        console.log(result);
    } else if (!result) {
        console.log(chalk.yellow(`Username or password incorrect`));
    } else {
        console.log(chalk.green(`User successfully logged in`));
    }
}

validateUser();
