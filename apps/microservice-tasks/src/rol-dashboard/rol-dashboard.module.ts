import { Module } from '@nestjs/common';
import { RolDashboardService } from './rol-dashboard.service';
import { RolDashboardController } from './rol-dashboard.controller';
import { InfraModule } from '@microservice-tasks/infra/infra.module';
import { AuthorizationModule } from '@microservice-tasks/authorization/authorization.module';

@Module({
  imports: [InfraModule, AuthorizationModule],
  controllers: [RolDashboardController],
  providers: [RolDashboardService],
  exports: [RolDashboardService],
})
export class RolDashboardModule { }
