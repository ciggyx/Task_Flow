import { Controller, Get, Param } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get(':email/get-owned-dashboards')
  async getOwnedDashboards(@Param('email') email: string) {
    return this.dashboardService.getOwnedDashboards(email);
  }

  @Get(':email/get-shared-dashboards')
  async getSharedDashboards(@Param('email') email: string) {
    return this.dashboardService.getSharedDashboards(email);
  }

  @Get(':id/tasks')
  async getDashboardTasks(@Param('id') id: string) {
    return this.dashboardService.getDashboardTasks(+id);
  }
}
