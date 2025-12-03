import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ClientsModule } from '@nestjs/microservices';
import { USERS_SERVICE } from '@api-gateway/config/microservice.config';

@Module({
  imports: [ClientsModule.register([USERS_SERVICE])],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
