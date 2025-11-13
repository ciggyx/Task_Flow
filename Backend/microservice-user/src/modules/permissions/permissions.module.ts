import { Module, forwardRef } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { PermissionRepository } from './infrastructure/permission.repository';
import { AuthService } from '../middleware/service.middleware';
import { JwtService } from '../jwt/jwt.service';
import { UsersService } from '../users/users.service';
import { UserRepository } from '../users/infrastructure/users.repository';
import { User } from '../users/entities/user.entity';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission]),
    TypeOrmModule.forFeature([User]),
    forwardRef(() => RolesModule),
  ],
  controllers: [PermissionsController],
  providers: [
    PermissionsService,
    PermissionRepository,
    UserRepository,
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
