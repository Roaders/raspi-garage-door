import { Controller, Get, UseGuards, Request, Post, Put } from '@nestjs/common';
import { AppService } from './app.service';
import { LocalAuthGuard, AuthService, JwtAuthGuard, ExchangeTokenAuthGuard } from './auth';

@Controller('api')
export class AppController {
    constructor(private readonly appService: AppService, private authService: AuthService) {}

    @Get('time')
    @UseGuards(JwtAuthGuard)
    getTime() {
        return this.appService.getTime();
    }

    @Put('loginAndControl')
    @UseGuards(LocalAuthGuard)
    getTimeBasic() {
        console.log(`loginAndControl`);
        return this.appService.getTime();
    }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req: any) {
        return this.authService.login(req.user);
    }

    @UseGuards(ExchangeTokenAuthGuard)
    @Get('exchangeToken')
    async exchangeToken(@Request() req: any) {
        console.log(`exchangeToken endpoint: ${req.user.username}`);
        return this.authService.login(req.user);
    }
}
