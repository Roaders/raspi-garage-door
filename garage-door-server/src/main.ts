import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { readFileSync } from 'fs';
import { IServerConfig } from '../../shared';
import chalk from 'chalk';

const serverConfig: IServerConfig = process.env;
let httpsOptions: { key: Buffer; cert: Buffer } | undefined;

if (serverConfig.certificatePath != null && serverConfig.keyPath != null) {
    console.log(`Configuring HTTPS.`);

    const key = readFileSync(serverConfig.keyPath);
    const cert = readFileSync(serverConfig.certificatePath);

    httpsOptions = {
        key,
        cert,
    };
} else {
    console.log(chalk.red(`No certificate defined. Starting in http mode.`));
}

async function bootstrap() {
    const port = serverConfig.port || 3000;
    const app = await NestFactory.create(AppModule, { httpsOptions });
    await app.listen(port);

    console.log(`Server listening on port ${port}`);
}
bootstrap();
