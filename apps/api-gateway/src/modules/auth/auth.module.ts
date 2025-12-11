import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ClientsModule } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { USERS_SERVICE } from '@api-gateway/config/microservice.config';
import { JwtRs256Guard } from './jwt-auth.guard';

@Module({
  imports: [ClientsModule.register([USERS_SERVICE]), PassportModule],
  providers: [AuthService, JwtRs256Guard],
  controllers: [AuthController],
  exports: [AuthService, JwtRs256Guard],
})
export class AuthModule {}
