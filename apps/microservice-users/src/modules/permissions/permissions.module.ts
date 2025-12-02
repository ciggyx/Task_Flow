import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { AuthService } from '../middleware/service.middleware';
import { JwtService } from '../jwt/jwt.service';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config';
import { InfraModule } from '../infra/infra.module';

@Module({
  imports: [InfraModule, UsersModule, ConfigModule],
  controllers: [PermissionsController],
  providers: [PermissionsService, AuthService, JwtService, UsersService],
  exports: [],
})
export class PermissionsModule {}
