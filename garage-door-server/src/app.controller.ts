import { Controller, Get, UseGuards, Request as RequestParam, Post, Put } from '@nestjs/common';
import { AppService } from './app.service';
import { LocalAuthGuard, AuthService, JwtAuthGuard, ExchangeTokenAuthGuard } from './auth';
import { Request } from 'express';
import { IControlDoor } from '../../shared';

@Controller('api')
export class AppController {
    constructor(private readonly appService: AppService, private authService: AuthService) {}

    @Put('door')
    @UseGuards(JwtAuthGuard)
    controlDoor(@RequestParam() req: Request<any, any, IControlDoor>) {
        console.log(`controlDoor ${req.body.action}`);
        return { result: `Control door ${req.body.action} at ${this.appService.getTime()}` };
    }

    @Put('login/door')
    @UseGuards(LocalAuthGuard)
    loginControlDoor(@RequestParam() req: Request<any, any, IControlDoor>) {
        console.log(`login-control-door ${req.body.action}`);
        return { result: `Login Control door ${req.body.action} at ${this.appService.getTime()}` };
    }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@RequestParam() req: any) {
        return this.authService.login(req.user);
    }

    @UseGuards(ExchangeTokenAuthGuard)
    @Get('exchangeToken')
    async exchangeToken(@RequestParam() req: any) {
        console.log(`exchangeToken endpoint: ${req.user.username}`);
        return this.authService.login(req.user);
    }
}
