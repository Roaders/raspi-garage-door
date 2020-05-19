import prompts from 'prompts';
import chalk from 'chalk';
import { join } from 'path';
import { writeFileSync } from 'fs';
import { randomBytes } from 'crypto';

console.log(`Generating jwt secret...`);

async function createUser() {
    const responses = await prompts([
        { name: `confirm`, type: `confirm`, message: `This will overwrite any existing '.env' file. Continue?` },
    ]);

    if (!responses.confirm) {
        console.log(chalk.red(`Exiting.`));
        return;
    }

    const envPath = join(process.cwd(), '.env');
    const secret = randomBytes(32).toString('hex');

    console.log(`Writing jwt secret to: '${envPath}'`);
    writeFileSync(envPath, `jwtSecret=${secret}`);
}

createUser();
