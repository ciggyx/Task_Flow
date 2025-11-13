import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsModule } from '../permissions/permissions.module';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'admin',
      database: 'UsersDatabase',
      autoLoadEntities: true,
      synchronize: true,
    }),
    PermissionsModule,
    RolesModule,
    UsersModule,
  ],
  providers: [SeedService],
})
export class SeedModule {}
