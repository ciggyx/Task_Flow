import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NOTIFICATIONS_SERVICE } from '@api-gateway/config/microservice.config';
import { ClientsModule } from '@nestjs/microservices/module/clients.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports:[ClientsModule.register([NOTIFICATIONS_SERVICE]), AuthModule],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
