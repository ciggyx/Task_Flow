import { Module } from '@nestjs/common';
import { RolDashboardService } from './rol-dashboard.service';
import { RolDashboardController } from './rol-dashboard.controller';
import { InfraModule } from '@microservice-tasks/infra/infra.module';

@Module({
  imports: [InfraModule],
  controllers: [RolDashboardController],
  providers: [RolDashboardService],
  exports: [],
})
export class RolDashboardModule { }
