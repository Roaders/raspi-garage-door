import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { readFileSync } from 'fs';
import { IServerConfig } from '../../shared';

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
}

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { httpsOptions });
    await app.listen(3000);
}
bootstrap();
