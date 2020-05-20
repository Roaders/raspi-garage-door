import { Controller, Get, UseGuards, Request, Post, UseFilters } from '@nestjs/common';
import { AppService } from './app.service';
import { LocalAuthGuard, AuthService, JwtAuthGuard, BasicAuthGuard, ExchangeTokenAuthGuard } from './auth';
import { BasicAuthExceptionFilter } from './auth/basic-auth-exception.filter';

@Controller('api')
export class AppController {
    constructor(private readonly appService: AppService, private authService: AuthService) {}

    @Get('time')
    @UseGuards(JwtAuthGuard)
    getTime() {
        return this.appService.getTime();
    }

    @Get('timeBasic')
    @UseGuards(BasicAuthGuard)
    @UseFilters(BasicAuthExceptionFilter)
    getTimeBasic() {
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
