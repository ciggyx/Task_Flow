import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { ClientsModule } from '@nestjs/microservices';
import { DASHBOARD_SERVICE, USERS_SERVICE } from '@api-gateway/config/microservice.config';
@Module({
  imports: [ClientsModule.register([USERS_SERVICE, DASHBOARD_SERVICE])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [],
})
export class DashboardModule {}
