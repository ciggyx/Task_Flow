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
  @Permissions('dashboard.read')
  async getOwnedDashboards(@Req() req) {
    return this.dashboardService.getOwnedDashboards(req.user.sub);
  }

  @ApiOkResponse({ type: DashboardDto, isArray: true })
  @Get(':email/shared')
  @Permissions('dashboard.read')
  async getSharedDashboards(@Param('email') email: string) {
    return this.dashboardService.getSharedDashboards(email);
  }

  @ApiOkResponse({ type: TaskDto, isArray: true })
  @Get(':id/tasks')
  @Permissions('task.read')
  async getDashboardTasks(@Param('id') id: string) {
    return this.dashboardService.getDashboardTasks(+id);
  }

  @ApiOkResponse({ type: UserDto, isArray: true })
  @Get(':id/users')
  @Permissions('dashboard.members.read')
  async getDashboardUsers(@Param('id') id: string) {
    return this.dashboardService.getDashboardUsers(+id);
  }
}