
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Req, UnauthorizedException } from '@nestjs/common';

import { Strategy } from 'passport-local';
import * as dotenv from 'dotenv';

import { UserService } from '../user/user.service';

dotenv.config();

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super();
  }

  async validate(username: string, password: string, @Req() req): Promise<any> {
    const user = await this.userService.validateUser(username, password, req.generatedTraceID);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}