import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AssignTaskDto } from './dto/assign-task.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MessagePattern } from '@nestjs/microservices';
import { Dashboard } from './entities/dashboard.entity';
import { CreateTaskDto } from '@microservice-tasks/task/dto/create-task.dto';
import { DashboardInvitationDto } from './dto/dashboard-invitation.dto';
import { CreateDashboardDto, DeleteDashboardDto } from '@shared/dtos';
import { UpdateDashboardDto } from '@shared/dtos';

@ApiTags('Dashboards')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @MessagePattern({ cmd: 'create_dashboard' })
  create(data: { createDashboardDto: CreateDashboardDto, userId: number }) {
    return this.dashboardService.create(data.createDashboardDto, data.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los dashboards' })
  @ApiResponse({ status: 200, description: 'Listado de dashboards devuelto.' })
  findAll() {
    return this.dashboardService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un dashboard por su ID' })
  @ApiResponse({ status: 200, description: 'Dashboard encontrado.' })
  @ApiResponse({ status: 404, description: 'Dashboard no encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dashboardService.findOne(id);
  }

  @MessagePattern({ cmd: 'update_dashboard' })
  // create(data: { createDashboardDto: CreateDashboardDto, userId: number }) {
  update(data: { updateDashboardDto: UpdateDashboardDto, dashboardId: number }) {
    return this.dashboardService.update(data.updateDashboardDto, data.dashboardId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un dashboard por su ID' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard eliminado exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Dashboard no encontrado.' })
  remove(@Body() deleteDashboardDto: DeleteDashboardDto) {
    return this.dashboardService.remove(+deleteDashboardDto);
  }

  @Post('assign-task')
  @ApiOperation({ summary: 'Asignar una tarea a un dashboard' })
  @ApiResponse({
    status: 201,
    description: 'Tarea asignada exitosamente al dashboard.',
  })
  @ApiResponse({ status: 404, description: 'Dashboard o Task no encontrado.' })
  async assignTask(@Body() assignTask: AssignTaskDto) {
    const taskResult = await this.dashboardService.assignTask(assignTask);
    if (!taskResult) {
      throw new NotFoundException(`Task is not assign`);
    }
    return taskResult;
  }

  @Post(':id/new-task')
  @ApiOperation({
    summary: 'Crear una nueva tarea y asignarla al dashboard especificado',
  })
  @ApiResponse({
    status: 201,
    description: 'Tarea creada y asignada exitosamente al dashboard.',
  })
  @ApiResponse({
    status: 404,
    description: 'Dashboard o entidad relacionada no encontrada.',
  })
  async createAndAssignTask(
    @Param('id', ParseIntPipe) dashboardId: number,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    const task = await this.dashboardService.createAndAssignTask({
      ...createTaskDto,
      dashboardId,
    });

    return task;
  }

  @MessagePattern({ cmd: 'get_owned_dashboards' })
  findOwned(data: { userId: number }): Promise<Dashboard[]> {
    return this.dashboardService.findOwned(data.userId);
  }

  @MessagePattern({ cmd: 'get_shared_dashboards' })
  findShared(data: { userId: number }): Promise<Dashboard[]> {
    return this.dashboardService.findShared(data.userId);
  }

  @MessagePattern({ cmd: 'get_users_dashboard' })
  findUsersInDashboard(data: { id: number }): Promise<number[]> {
    return this.dashboardService.findUsersInDashboard(data.id);
  }

  @MessagePattern({ cmd: 'dashboard_invite' })
  handleDashboardInvite(data: DashboardInvitationDto) {
    return this.dashboardService.processDashboardInvitation(data);
  }
}
