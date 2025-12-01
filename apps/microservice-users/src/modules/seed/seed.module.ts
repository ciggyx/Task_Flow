import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsModule } from '../permissions/permissions.module';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config';
import { configuration } from 'src/config/configuration';

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
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.cwd()}/apps/microservice-users/src/config/env/${process.env.NODE_ENV}.env`,
      load: [configuration],
    }),
    PermissionsModule,
    RolesModule,
    UsersModule,
  ],
  providers: [SeedService],
})
export class SeedModule {}
