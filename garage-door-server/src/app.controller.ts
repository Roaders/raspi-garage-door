import { Controller, Get, UseGuards, Request as RequestParam, Post, Put } from '@nestjs/common';
import { LocalAuthGuard, AuthService, JwtAuthGuard, ExchangeTokenAuthGuard } from './auth';
import { Request } from 'express';
import { GarageDoorService } from '../../rpi-garage-door/src';
import { DoorStatusGateway } from './services';
import { from } from 'rxjs';

@Controller('api')
export class AppController {
    constructor(
        private authService: AuthService,
        private garageDoorService: GarageDoorService,
        private gateway: DoorStatusGateway,
    ) {}

    @Get('/garage/door')
    @UseGuards(JwtAuthGuard)
    getDoorStatus() {
        return this.garageDoorService.getState();
    }

    @Put('/garage/door')
    @UseGuards(JwtAuthGuard)
    controlDoor(@RequestParam() req: Request) {
        setTimeout(
            () => from(this.garageDoorService.getState()).subscribe((status) => this.gateway.updateStatus(status)),
            Math.random() * 5000,
        );
        return this.garageDoorService.setState(req.body);
    }

    @Put('login/door')
    @UseGuards(LocalAuthGuard)
    loginControlDoor(@RequestParam() req: Request) {
        return this.garageDoorService.setState(req.body);
    }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@RequestParam() req: any) {
        return this.authService.login(req.user);
    }

    @UseGuards(ExchangeTokenAuthGuard)
    @Get('exchangeToken')
    async exchangeToken(@RequestParam() req: any) {
        return this.authService.login(req.user);
    }
}
