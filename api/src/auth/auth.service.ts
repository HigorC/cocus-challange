import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService
  ) { }

  async login(user: any, traceID: string) {
    this.logger.log({
      traceID,
      message: 'Logging in'
    })

    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: `${process.env.JWT_SECRET}`
      }),
    };
  }
}