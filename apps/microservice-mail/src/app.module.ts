import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/microservice-mail/src/config/env/.env',
    }),
    BullModule.forRoot({
      connection: {
        host: 'localhost', // Como tu código corre en Windows y Redis en Docker, es localhost
        port: 6379,
      },
    }),
    MailModule,
  ],
})
export class AppModule {}
