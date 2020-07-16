import { Controller, Get, UseGuards, Request as RequestParam, Post, Put, Query } from '@nestjs/common';
import { LocalAuthGuard, AuthService, JwtAuthGuard, ExchangeTokenAuthGuard } from './auth';
import { Request } from 'express';
import { GarageDoorService } from '../../rpi-garage-door/src';
import { ImagesService } from './services';

@Controller('api')
export class AppController {
    constructor(
        private authService: AuthService,
        private garageDoorService: GarageDoorService,
        private imagesService: ImagesService,
    ) {}

    @Get('/garage/image')
    @UseGuards(JwtAuthGuard)
    getImages(@Query('maxCount') maxCount?: string, @Query('before') before?: string) {
        return this.imagesService.getImages(
            maxCount != null ? parseInt(maxCount) : undefined,
            before != null ? parseInt(before) : undefined,
        );
    }

    @Get('/garage/door')
    @UseGuards(JwtAuthGuard)
    getDoorStatus() {
        return this.garageDoorService.getState();
    }

    @Put('/garage/door')
    @UseGuards(JwtAuthGuard)
    controlDoor(@RequestParam() req: Request) {
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
