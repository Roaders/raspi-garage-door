import chalk from 'chalk';

if (process.env.jwtSecret == null) {
    console.log(chalk.red(`WARNING: jwtSecret not defined in '.env'. Please define a secret.`));
    console.log(chalk.red(`NOT SAFE FOR PRODUCTION`));
}

export const jwtConstants = {
    secret: process.env.jwtSecret || 'secretKey',
    tokenExpiry: '30s',
    refreshExpiry: '60s',
};
