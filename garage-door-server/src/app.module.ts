import { Module, DynamicModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { existsSync } from 'fs';
import { AuthModule } from './auth';
import { UsersModule } from './users/users.module';
import chalk from 'chalk';
import { GarageDoorService } from '../../rpi-garage-door/src';
import { DoorStatusGateway } from './services';

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

@Module({
    imports: [...imports, AuthModule, UsersModule],
    controllers: [AppController],
    providers: [GarageDoorService, DoorStatusGateway],
})
export class AppModule {}
