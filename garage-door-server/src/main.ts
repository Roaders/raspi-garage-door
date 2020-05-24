import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import chalk from 'chalk';
import express from 'express';
import http from 'http';
import https from 'https';
import { getSSLConfig, getPort } from './helpers';
import io from 'socket.io';

const httpsOptions = getSSLConfig();

if (httpsOptions != null) {
    console.log(`Configuring HTTPS.`);
} else {
    console.log(chalk.red(`No certificate defined. Starting in http only mode.`));
}

const users: any[] = [];

async function bootstrap() {
    const expressServer = express();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressServer));

    await app.init();

    if (httpsOptions) {
        const sslPort = getPort();
        https.createServer(httpsOptions, expressServer).listen(sslPort);
        console.log(`HTTPS listening on port ${sslPort}`);
    } else {
        const port = getPort();
        const server = http.createServer(expressServer);

        const ioServer = io(server);

        ioServer.on('connection', (socket) => {
            console.log('A user connected');
            socket.on('setUsername', (data) => {
                console.log(data);

                if (users.indexOf(data) > -1) {
                    socket.emit('userExists', data + ' username is taken! Try some other username.');
                } else {
                    users.push(data);
                    socket.emit('userSet', { username: data });
                }
            });

            setInterval(() => ioServer.sockets.emit('newmsg', `test: ${Date.now()}`), 2500);
        });

        server.listen(port);
        console.log(`HTTP listening on port ${port}`);
    }
}
bootstrap();
