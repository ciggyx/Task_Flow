import { Controller, Get, Param, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto } from '@shared/dtos';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Task } from './entities/task.entity';
import { MessagePattern, Payload } from '@nestjs/microservices';
import 'multer';

@ApiTags('Tasks')
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  // --- MÉTODOS HTTP (Swagger) ---

  @Get()
  @ApiOperation({ summary: 'Obtener todas las tareas' })
  @ApiResponse({ status: 200, description: 'Lista de tareas obtenida.', type: [Task] })
  async findAll() {
    return await this.taskService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una tarea por su ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Tarea encontrada.', type: Task })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const task = await this.taskService.findOne(id);
    if (!task) {
      throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
    }
    return task;
  }

  // --- PATRONES DE MENSAJERÍA (Comunicación Interna) ---

  @MessagePattern({ cmd: 'create_task' })
  create(@Payload() data: { createTaskDto: CreateTaskDto, files?: Array<Express.Multer.File> }) {
    return this.taskService.create(data.createTaskDto, data.files);
  }

  @MessagePattern({ cmd: 'update_task' })
  update(@Payload() data: { id: number, updateTaskDto: UpdateTaskDto, userId: number }) {
    return this.taskService.update(data.id, data.updateTaskDto, data.userId);
  }

  @MessagePattern({ cmd: 'delete_task' })
  remove(@Payload() data: { id: number, userId: number }) {
    return this.taskService.remove(data.id, data.userId);
  }

  @MessagePattern({ cmd: 'get_dashboard_tasks' })
  findTasksWithDashboardId(@Payload() data: { id: number }): Promise<Task[]> {
    return this.taskService.findTasksWithDashboardId(data.id);
  }
}