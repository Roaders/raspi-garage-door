import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { IServerConfig } from '../../shared';

const configPath = join(process.cwd(), 'serverConfig.json');
let httpsOptions: { key: Buffer; cert: Buffer } | undefined;

console.log(`Checking for server config at '${configPath}'`);

if (existsSync(configPath)) {
    console.log(`Loading server config...`);

    const serverConfig: IServerConfig = JSON.parse(readFileSync(configPath).toString());

    if (serverConfig.certificatePath != null && serverConfig.keyPath != null) {
        console.log(`Configuring HTTPS.`);

        const key = readFileSync(serverConfig.keyPath);
        const cert = readFileSync(serverConfig.certificatePath);

        httpsOptions = {
            key,
            cert,
        };
    }
}

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { httpsOptions });
    await app.listen(3000);
}
bootstrap();
