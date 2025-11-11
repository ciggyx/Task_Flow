import { Controller, Get, Param } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get(':email/get-owned-dashboards')
  async getOwnedDashboards(@Param('email') email: string) {
    return this.dashboardService.getOwnedDashboards(email);
  }
}
