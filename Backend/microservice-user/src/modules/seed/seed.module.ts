import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from '../permissions/entities/permission.entity';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';

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
    TypeOrmModule.forFeature([Permission, Role, User]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
