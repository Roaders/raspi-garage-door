import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import chalk from 'chalk';
import express from 'express';
import http from 'http';
import https from 'https';
import { getSSLConfig, getPort } from './helpers';

const httpsOptions = getSSLConfig();

if (httpsOptions != null) {
    console.log(`Configuring HTTPS.`);
} else {
    console.log(chalk.red(`No certificate defined. Starting in http only mode.`));
}

async function bootstrap() {
    const server = express();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

    await app.init();

    if (httpsOptions) {
        const sslPort = getPort();
        https.createServer(httpsOptions, server).listen(sslPort);
        console.log(`HTTPS listening on port ${sslPort}`);
    } else {
        const port = getPort();
        http.createServer(server).listen(port);
        console.log(`HTTP listening on port ${port}`);
    }
}
bootstrap();
