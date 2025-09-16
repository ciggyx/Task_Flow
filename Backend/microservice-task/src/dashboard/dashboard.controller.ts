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
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Dashboards')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo dashboard' })
  @ApiResponse({ status: 201, description: 'Dashboard creado exitosamente.' })
  create(@Body() createDashboardDto: CreateDashboardDto) {
    return this.dashboardService.create(createDashboardDto);
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

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un dashboard por su ID' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard actualizado exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Dashboard no encontrado.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDashboardDto: UpdateDashboardDto,
  ) {
    return this.dashboardService.update(id, updateDashboardDto);
  }

  @Delete(':id')
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
}
