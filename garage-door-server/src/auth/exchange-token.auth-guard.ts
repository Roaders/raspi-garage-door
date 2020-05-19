import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class ExchangeTokenAuthGuard extends AuthGuard('exchange-token') {}
