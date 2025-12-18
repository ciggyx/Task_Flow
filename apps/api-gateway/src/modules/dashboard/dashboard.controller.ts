import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardDto } from './interfaces/dashboard.dto';
import { TaskDto } from './interfaces/task.dto';
import { UserDto } from './interfaces/user.dto';
import { JwtRs256Guard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../authorization/permission.guard';
import { Permissions } from '../authorization/permission.decorator';
import { DashboardInvitationDto } from './dto/dashboard-invitation.dto';
import { CreateDashboardDto } from '@shared/dtos';
import { CreateDashboardDoc } from './docs/create-dashboard.doc';

@Controller('dashboard')
@ApiBearerAuth('access-token')
@UseGuards(JwtRs256Guard, PermissionsGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Post()
  @Permissions('dashboard.create')
  @CreateDashboardDoc()
  create(@Body() createDashboardDto: CreateDashboardDto, @Req() req) {
    return this.dashboardService.create(createDashboardDto, req.user.sub);
  }

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
  @ApiOkResponse({ type: DashboardInvitationDto })
  @Post('dashboard-invite')
  @ApiOperation({
    summary: 'Invitar un usuario a un dashboard',
    description:
      'Procesa la invitación y envía un correo electrónico al usuario invitado.',
  })
  @ApiBody({ type: DashboardInvitationDto })
  @ApiResponse({
    status: 201,
    description: 'Invitación procesada y correo enviado correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  async inviteToDashboard(
    @Req() req: Request,
    @Body() dto: DashboardInvitationDto,
  ) {
    const mailData =
      await this.dashboardService.processDashboardInvitation(dto);

    return this.dashboardService.sendDashboardInvitationMail(mailData);
  }
}
