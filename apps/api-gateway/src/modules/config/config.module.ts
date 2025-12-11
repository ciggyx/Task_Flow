import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `${process.cwd()}/apps/microservice-users/config/env/${process.env.NODE_ENV}.env`,
      ],
      expandVariables: true,
    }),
  ],
  exports: [ConfigModule],
})
export class ConfigEnvModule {}
