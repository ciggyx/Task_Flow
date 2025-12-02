import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { configuration } from 'src/config/configuration';
import { InfraModule } from '../infra/infra.module';

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
    InfraModule,
  ],
  providers: [SeedService],
})
export class SeedModule {}
