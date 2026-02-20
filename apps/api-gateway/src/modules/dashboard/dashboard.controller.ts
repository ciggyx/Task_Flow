import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { DashboardDto } from './interfaces/dashboard.dto';
import { UserDto } from './interfaces/user.dto';
import { JwtRs256Guard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../authorization/permission.guard';
import { Permissions } from '../authorization/permission.decorator';
import { DashboardInvitationDto } from './dto/dashboard-invitation.dto';
import { CreateDashboardDto, UpdateDashboardDto } from '@shared/dtos';
import { CreateDashboardDoc } from './docs/create-dashboard.doc';
import { UpdateDashboardDoc } from './docs/update-dashboard.doc';
import { DeleteDashboardDoc } from './docs/delete-dashboard.doc';
import { TaskResponseDto } from '@shared/dtos';
import { User } from '@api-gateway/common/decorators/user.decorator';
import { EventPattern, Payload } from '@nestjs/microservices';
import { DashboardNotificationDto } from '@shared/dtos';
import { ChangeRoleDto } from './dto/user-role-update.dto';
import { DashboardStatsQueryDto } from './dto/dashboard-query.dto';

@Controller('dashboard')
@ApiBearerAuth('access-token')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Post()
  @UseGuards(JwtRs256Guard, PermissionsGuard)
  @Permissions('dashboard.create')
  @CreateDashboardDoc()
  create(
    @Body() createDashboardDto: CreateDashboardDto, 
    @User('sub') userId: number 
  ) {
    return this.dashboardService.create(createDashboardDto, userId);
  }

  @Patch(':id')
  @UseGuards(JwtRs256Guard, PermissionsGuard)
  @Permissions('dashboard.update')
  @UpdateDashboardDoc()
  update(
    @User('sub') userId:number, 
    @Body() updateDashboardDto: UpdateDashboardDto, @Param('id') id: number) {
    return this.dashboardService.update(updateDashboardDto, id, userId);
  }

  @Delete(':id')
  @UseGuards(JwtRs256Guard, PermissionsGuard)
  @Permissions('dashboard.delete')
  @HttpCode(204)
  @DeleteDashboardDoc()
  delete(
    @User('sub') userId:number,
    @Param('id') id: number) {
    return this.dashboardService.delete(id, userId);
  }

  @ApiOkResponse({ type: DashboardDto, isArray: true })
  @Get('owned')
  @UseGuards(JwtRs256Guard, PermissionsGuard)
  @Permissions('dashboard.read')
  @ApiOperation({ summary: 'Obtener dashboards propios del usuario autenticado' })
  async getOwnedDashboards(@User('sub') userId: number) {
    return this.dashboardService.getOwnedDashboards(userId);
  }

  @ApiOkResponse({ type: DashboardDto, isArray: true })
  @Get('shared')
  @UseGuards(JwtRs256Guard, PermissionsGuard)
  @Permissions('dashboard.read')
  @ApiOperation({ summary: 'Obtener dashboards compartidos con el usuario autenticado' })
  async getSharedDashboards(@User('sub') userId: number) {
    return this.dashboardService.getSharedDashboards(userId);
  }

  @ApiOkResponse({ type: TaskResponseDto, isArray: true })
  @Get(':id/tasks')
  @UseGuards(JwtRs256Guard, PermissionsGuard)
  @Permissions('task.read')
  async getDashboardTasks(@Param('id') id: number) {
    return this.dashboardService.getDashboardTasks(id);
  }

  @ApiOkResponse({ type: UserDto, isArray: true })
  @Get(':id/users')
  @UseGuards(JwtRs256Guard, PermissionsGuard)
  @Permissions('dashboard.members.read')
  async getDashboardUsers(@Param('id') id: number) {
    return this.dashboardService.getDashboardUsers(id);
  }

  @ApiOkResponse({ type: DashboardInvitationDto })
  @Post('dashboard-invite')
  @UseGuards(JwtRs256Guard, PermissionsGuard)
  @Permissions('dashboard.members.update')
  @ApiOperation({ summary: 'Invitar un usuario a un dashboard' })
  @ApiBody({ type: DashboardInvitationDto })
  async inviteToDashboard(
    @User('sub') userId: number,
    @Body() dto: DashboardInvitationDto
  ) {
    dto.invitedBy = userId; 
    return await this.dashboardService.processDashboardInvitation(dto);
  }

  @Post('accept-invite/:id')
  @UseGuards(JwtRs256Guard)
  async acceptInvite(
    @Param('id') invitationId: string, 
    @User('sub') userId: number
  ) {
    return await this.dashboardService.acceptInvitation(invitationId, userId);
  }

  @Get('revision/:id')
  @UseGuards(JwtRs256Guard)
  async isRevisable(
    @Param('id') dashboardId: number, 
  ) {
    return await this.dashboardService.isRevisable(dashboardId);
  }

  @Get(':id')
  @UseGuards(JwtRs256Guard)
  async getDashboard(
    @Param('id') dashboardId: number, 
  ) {
    return await this.dashboardService.getDashboard(dashboardId);
  }



  @EventPattern('dashboard_invitation_created')
  async notifyDashboardInvitation(@Payload() data: DashboardNotificationDto) {
    return await this.dashboardService.notifyInvitation(data);
  }

  @Delete(':dbid/delete-user/:id')
  @UseGuards(JwtRs256Guard)
  async deleteUser(
    @Param('dbid') dashboardId : number,
    @Param('id') userId: number,
    @User('sub') deleterId: number,
  ){
    return await this.dashboardService.deleteUser(dashboardId, userId, deleterId)
  }

  @Patch(':dbid/change-role/:id')
  @UseGuards(JwtRs256Guard)
  async changeUserRole(
    @Param('dbid') dashboardId: number,
    @Param('id') userId: number,
    @User('sub') updaterId: number,
    @Body() dto: ChangeRoleDto,
  ) {
    return await this.dashboardService.updateUserRole(dashboardId, userId, updaterId, dto.roleId);
  }

  @Get('statistics/:id')
  @UseGuards(JwtRs256Guard)
  async getDashboardStats(
    @Param('id', ParseIntPipe) dashboardId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const payload: DashboardStatsQueryDto = { dashboardId, startDate, endDate };
    return await this.dashboardService.getDashboardStats(payload)
  }
}