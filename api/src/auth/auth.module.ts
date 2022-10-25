import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';

import * as dotenv from 'dotenv';
import { UserService } from '../user/user.service';
import { CommonModule } from '../common/common.module';
import { EncrypterBcrypt } from '../common/hash/encrypter-bcrypt';

dotenv.config();

@Module({
  imports: [
    CommonModule,
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: `${process.env.JWT_SECRET}`,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    UserService, {
      provide: "EncrypterInterface",
      useClass: EncrypterBcrypt
    }],
  exports: [AuthService],
})
export class AuthModule { }
