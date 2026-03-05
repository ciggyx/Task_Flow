import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AssignTaskDto } from './dto/assign-task.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateDashboardDto} from '@shared/dtos';
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
  update(data: { updateDashboardDto: UpdateDashboardDto, dashboardId: number, userId:number }) {
    return this.dashboardService.update(data.updateDashboardDto, data.dashboardId, data.userId);
  }

  @MessagePattern({ cmd: 'get_dashboard' })
  getDashboard(data: { dashboardId : number }) {
    return this.dashboardService.getDashboard(data.dashboardId);
  }

  @MessagePattern({ cmd: 'delete_dashboard' })
  remove(data: { dashboardId: number, userId:number }) {
    return this.dashboardService.remove(data.dashboardId, data.userId);
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

  @MessagePattern({ cmd: 'is_revisable' })
  async isRevisable(@Payload() data: { dashboardId: number }): Promise<boolean> {
    return await this.dashboardService.isRevisable(data.dashboardId);
  }

}
