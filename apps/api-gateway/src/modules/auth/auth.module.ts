import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ClientsModule } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { USERS_SERVICE } from '@api-gateway/config/microservice.config';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    ClientsModule.register([USERS_SERVICE]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_AUTH_SECRET || 'fallback_secret_dev',
      signOptions: { expiresIn: '60m' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
