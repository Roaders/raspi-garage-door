import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from "@nestjs/platform-express"
import { AppModule } from './app.module';
import { readFileSync } from 'fs';
import { IServerConfig } from '../../shared';
import chalk from 'chalk';
import express from "express";
import http from "http"
import https from "https"

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
    console.log(chalk.red(`No certificate defined. Starting in http only mode.`));
}

async function bootstrap() {
    const port = serverConfig.port || 3000;
    const server = express();
    const app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(server),
    );

    await app.init();

    if(httpsOptions){
        const sslPort = serverConfig.sslPort || 3443;
        https.createServer(httpsOptions, server).listen(sslPort);
        console.log(`HTTPS listening on port ${sslPort}`);
    } else {
        http.createServer(server).listen(port);
        console.log(`HTTP listening on port ${port}`);
    }
}
bootstrap();
