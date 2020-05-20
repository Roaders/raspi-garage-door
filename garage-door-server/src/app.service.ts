import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    getTime() {
        return new Date().toTimeString();
    }
}
