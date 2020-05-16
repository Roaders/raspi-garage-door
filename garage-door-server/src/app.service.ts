import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    getTime() {
        return { time: new Date().toTimeString() };
    }
}
