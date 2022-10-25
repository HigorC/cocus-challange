import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { LocalStrategy } from './auth/local.strategy';
import { UserModule } from './user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './user/user.service';
import { CommonModule } from './common/common.module';
import { EncrypterBcrypt } from './common/encrypter-bcrypt';
import { logger } from './common/logger.middleware';
import { UserController } from './user/user.controller';

@Module({
  imports: [
    CommonModule,
    UserModule,
    AuthModule,
    JwtModule.register({
      secret: `${process.env.JWT_SECRET}`,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [
    JwtStrategy,
    LocalStrategy,
    AuthService,
    UserService,
    {
      provide: "EncrypterInterface",
      useClass: EncrypterBcrypt
    }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(logger).forRoutes(UserController)
  }
}
