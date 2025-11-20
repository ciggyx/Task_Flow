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
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthMiddleware } from 'src/middleware/auth.middleware';
import { Permissions } from 'src/middleware/decorators/permissions.decorator';
import { CreateTaskDto } from 'src/task/dto/create-task.dto';
import { MessagePattern } from '@nestjs/microservices';
import { Dashboard } from './entities/dashboard.entity';

@ApiTags('Dashboards')
@Controller('dashboard')
@UseGuards(AuthMiddleware)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  @Permissions(['createDashboard'])
  @ApiOperation({ summary: 'Crear un nuevo dashboard' })
  @ApiResponse({ status: 201, description: 'Dashboard creado exitosamente.' })
  create(@Body() createDashboardDto: CreateDashboardDto) {
    return this.dashboardService.create(createDashboardDto);
  }

  @Get()
  @Permissions(['getDashboards'])
  @ApiOperation({ summary: 'Obtener todos los dashboards' })
  @ApiResponse({ status: 200, description: 'Listado de dashboards devuelto.' })
  findAll() {
    return this.dashboardService.findAll();
  }

  @Get(':id')
  @Permissions(['getDashboard'])
  @ApiOperation({ summary: 'Obtener un dashboard por su ID' })
  @ApiResponse({ status: 200, description: 'Dashboard encontrado.' })
  @ApiResponse({ status: 404, description: 'Dashboard no encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dashboardService.findOne(id);
  }

  @Patch(':id')
  @Permissions(['updateDashboard'])
  @ApiOperation({ summary: 'Actualizar un dashboard por su ID' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard actualizado exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Dashboard no encontrado.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDashboardDto: UpdateDashboardDto) {
    return this.dashboardService.update(id, updateDashboardDto);
  }

  @Delete(':id')
  @Permissions(['deleteDashboard'])
  @ApiOperation({ summary: 'Eliminar un dashboard por su ID' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard eliminado exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Dashboard no encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.dashboardService.remove(id);
  }

  @Post('assign-task')
  @Permissions(['assignTask'])
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
  @Permissions(['createTask'])
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
}
