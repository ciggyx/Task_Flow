import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { DashboardDto } from './interfaces/dashboard.dto';
import { TaskDto } from './interfaces/task.dto';
import { UserDto } from './interfaces/user.dto';
import { JwtRs256Guard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../authorization/permission.guard';
import { Permissions } from '../authorization/permission.decorator';

@Controller('dashboard')
@ApiBearerAuth('access-token')
@UseGuards(JwtRs256Guard, PermissionsGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOkResponse({ type: DashboardDto, isArray: true })
  @Get('owned')
  @Permissions('getDashboard')
  async getOwnedDashboards(@Req() req) {
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
