import { Module } from '@nestjs/common';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { UsersModule } from './modules/users/users.module';
import { MiddlewareModule } from './modules/middleware/middleware.module';
import { AuthModule } from './modules/auth/auth.module';
import { CoreModule } from './modules/core/core.module';
import { InfraModule } from './modules/infra/infra.module';
import { DatabaseModule } from './modules/database/database.module';

@Module({
  imports: [
    DatabaseModule,
    CoreModule,
    InfraModule,
    PermissionsModule,
    RolesModule,
    AuthModule,
    MiddlewareModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
