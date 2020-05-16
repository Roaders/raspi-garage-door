import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get('time')
    getTime() {
        return this.appService.getTime();
    }
}
