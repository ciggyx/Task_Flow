import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { DashboardDto } from './interfaces/dashboard.dto';
import { TaskDto } from './interfaces/task.dto';
import { UserDto } from './interfaces/user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOkResponse({ type: DashboardDto, isArray: true })
  @Get('owned')
  async getOwnedDashboards(@Req()req) {
    const userId = req.user.sub;
    return this.dashboardService.getOwnedDashboards(userId);
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
