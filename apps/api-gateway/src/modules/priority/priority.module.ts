import { Module } from '@nestjs/common';
import { PriorityService } from './priority.service';
import { PriorityController } from './priority.controller';
import { ClientsModule } from '@nestjs/microservices/module/clients.module';
import { DASHBOARD_SERVICE } from '@api-gateway/config/microservice.config';

@Module({
  imports: [ClientsModule.register([DASHBOARD_SERVICE])],
  controllers: [PriorityController],
  providers: [PriorityService],
})
export class PriorityModule {}
