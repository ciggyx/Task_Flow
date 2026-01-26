import { Module } from '@nestjs/common';
import { StatusService } from './status.service';
import { StatusController } from './status.controller';
import { ClientsModule } from '@nestjs/microservices';
import { DASHBOARD_SERVICE } from '@api-gateway/config/microservice.config';

@Module({
  imports: [ClientsModule.register([DASHBOARD_SERVICE])], 
  controllers: [StatusController],
  providers: [StatusService],
  exports:[], 
})
export class StatusModule {}
