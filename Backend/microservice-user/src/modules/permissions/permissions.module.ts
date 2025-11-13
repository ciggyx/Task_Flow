import { Module, forwardRef } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { PermissionRepository } from './infrastructure/permission.repository';
import { AuthService } from '../middleware/service.middleware';
import { JwtService } from '../jwt/jwt.service';
import { UsersService } from '../users/users.service';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission]),
    forwardRef(() => RolesModule),
    UsersModule,
    ConfigModule,
  ],
  controllers: [PermissionsController],
  providers: [
    PermissionsService,
    AuthService,
    JwtService,
    UsersService,
    {
      provide: 'IPermissionRepository',
      useClass: PermissionRepository,
    },
  ],
  exports: ['IPermissionRepository'],
})
export class PermissionsModule {}
