import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import chalk from 'chalk';
import { getSSLConfig, getPort } from './helpers';

const httpsOptions = getSSLConfig();

if (httpsOptions != null) {
    console.log(`Configuring HTTPS.`);
} else {
    console.log(chalk.red(`No certificate defined. Starting in http only mode.`));
}

async function bootstrap() {
    const port = getPort();
    const app = await NestFactory.create(AppModule, { httpsOptions });

    await app.listen(port);

    if (httpsOptions) {
        console.log(`HTTPS listening on port ${port}`);
    } else {
        console.log(`HTTP listening on port ${port}`);
    }
}
bootstrap();
