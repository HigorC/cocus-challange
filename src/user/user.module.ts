import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthService } from '../auth/auth.service';

@Module({
  providers: [UserService, AuthService, JwtService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule { }
