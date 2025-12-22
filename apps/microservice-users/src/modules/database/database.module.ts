import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        // Esto tiene dos paths porque dependiendo de como lo runees te toma una dirección
        // u otra.. Por el momento se queda así con parche porque no puedo entender
        // como toma la decisión de elegir cual path.
        `${process.cwd()}/config/env/${process.env.NODE_ENV}.env`,
        `${process.cwd()}/apps/microservice-users/config/env/${process.env.NODE_ENV}.env`,
      ],
      expandVariables: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule { }
