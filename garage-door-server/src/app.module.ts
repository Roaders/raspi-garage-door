/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Module, DynamicModule, Provider, ValueProvider } from '@nestjs/common';
import { AppController } from './app.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { existsSync } from 'fs';
import { AuthModule } from './auth';
import { UsersModule } from './users/users.module';
import chalk from 'chalk';
import { GarageDoorService } from '../../rpi-garage-door/src';
import { DoorStatusGateway, ImagesService } from './services';
import { AsyncIterableServiceFactory } from '../../rpi-garage-door/src/services/async-iterable.service';
import { IGarageDoorStatus } from '../../shared';
import { parseConfig } from './helpers';
import { PiCameraFactory } from './factory';

const rootPath = join(__dirname, '../../', 'garage-door-ui');
const imports = new Array<DynamicModule>();

if (existsSync(rootPath)) {
    imports.push(
        ServeStaticModule.forRoot({
            rootPath,
        }),
    );
} else {
    console.log(chalk.yellow(`WARNING: no docs folder found. Static files not available.`));
}

const serverConfig = parseConfig(process.env);

const providers: Provider[] = [
    {
        provide: GarageDoorService,
        useFactory: (factory: AsyncIterableServiceFactory<IGarageDoorStatus>) =>
            new GarageDoorService(factory, { invertRelayControl: serverConfig.invertRelayControl }),
        inject: [AsyncIterableServiceFactory],
    },
    DoorStatusGateway,
    ImagesService,
    AsyncIterableServiceFactory,
    {
        provide: 'serverConfig',
        useValue: serverConfig,
    },
];

if (serverConfig.imagePath != null) {
    const factoryProvider: ValueProvider = {
        provide: PiCameraFactory,
        useValue: new PiCameraFactory(serverConfig.imagePath),
    };

    providers.push(factoryProvider);
}

@Module({
    imports: [...imports, AuthModule, UsersModule],
    controllers: [AppController],
    providers,
})
export class AppModule {
    constructor(_imagesService: ImagesService) {}
}
