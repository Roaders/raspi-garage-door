import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class ExchangeTokenAuthGuard extends AuthGuard('exchange-token') {}

@Injectable()
export class BasicAuthGuard extends AuthGuard('basic') {}
