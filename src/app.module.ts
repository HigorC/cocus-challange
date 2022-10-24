import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { LocalStrategy } from './auth/local.strategy';
import { UserModule } from './user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './user/user.service';
@Module({
  imports: [
    UserModule,
    AuthModule,
    JwtModule.register({
      secret: `${process.env.JWT_SECRET}`,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [JwtStrategy, LocalStrategy, AuthService, UserService]
})
export class AppModule { }
