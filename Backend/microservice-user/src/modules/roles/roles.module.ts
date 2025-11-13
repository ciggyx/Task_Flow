import { Module, forwardRef } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Role } from './entities/role.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsModule } from '../permissions/permissions.module';
import { RoleRepository } from './infrastructure/roles.repository';
import { MiddlewareModule } from '../middleware/middleware.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]),
    forwardRef(() => PermissionsModule),
    forwardRef(() => MiddlewareModule),
  ],
  controllers: [RolesController],
  providers: [
    RolesService,
    {
      provide: 'IRoleRepository',
      useClass: RoleRepository,
    },
  ],
  exports: ['IRoleRepository'],
})
export class RolesModule {}
