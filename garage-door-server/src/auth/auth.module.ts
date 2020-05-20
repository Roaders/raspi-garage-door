import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { BasicStrategy, LocalStrategy, JwtStrategy, ExchangeTokenStrategy } from './strategies';

@Module({
    imports: [
        UsersModule,
        PassportModule,
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: { expiresIn: jwtConstants.tokenExpiry },
        }),
    ],
    providers: [AuthService, LocalStrategy, BasicStrategy, JwtStrategy, ExchangeTokenStrategy],
    exports: [AuthService],
})
export class AuthModule {}
