import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '../common/common.module';
import { EncrypterBcrypt } from '../common/hash/encrypter-bcrypt';

@Module({
  imports: [CommonModule],
  providers: [UserService, AuthService, JwtService, {
    provide: "EncrypterInterface",
    useClass: EncrypterBcrypt
  }],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule { }
