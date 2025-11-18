import { Controller, Get, Param } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiOkResponse } from '@nestjs/swagger';
import { DashboardDto } from './interfaces/dashboard.dto';
import { TaskDto } from './interfaces/task.dto';
import { UserDto } from './interfaces/user.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOkResponse({ type: DashboardDto, isArray: true })
  @Get(':email/get-owned-dashboards')
  async getOwnedDashboards(@Param('email') email: string) {
    return this.dashboardService.getOwnedDashboards(email);
  }

  @ApiOkResponse({ type: DashboardDto, isArray: true })
  @Get(':email/get-shared-dashboards')
  async getSharedDashboards(@Param('email') email: string) {
    return this.dashboardService.getSharedDashboards(email);
  }

  @ApiOkResponse({ type: TaskDto, isArray: true })
  @Get(':id/tasks')
  async getDashboardTasks(@Param('id') id: string) {
    return this.dashboardService.getDashboardTasks(+id);
  }

  @ApiOkResponse({ type: UserDto, isArray: true })
  @Get(':id/users')
  async getDashboardUsers(@Param('id') id: string) {
    return this.dashboardService.getDashboardUsers(+id);
  }
}
