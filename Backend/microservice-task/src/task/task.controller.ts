import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ApiTags } from '@nestjs/swagger';
import { TaskResponseDto } from './dto/response-task.dto';
import { AuthMiddleware } from 'src/middleware/auth.middleware';
import { Permissions } from 'src/middleware/decorators/permissions.decorator';
import { Task } from './entities/task.entity';
import { MessagePattern } from '@nestjs/microservices';

@ApiTags('Tasks')
@Controller('task')
@UseGuards(AuthMiddleware)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @Permissions(['createTask'])
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto);
  }

  @Get()
  @Permissions(['getTasks'])
  async findAll() {
    const tasks = await this.taskService.findAll();
    return tasks.map((task) => new TaskResponseDto(task));
  }

  @Get(':id')
  @Permissions(['getTask'])
  async findOne(@Param('id') id: string) {
    const task = await this.taskService.findOne(+id);
    if (!task) {
      return null;
    }
    return new TaskResponseDto(task);
  }

  @Patch(':id')
  @Permissions(['updateTask'])
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(+id, updateTaskDto);
  }

  @Delete(':id')
  @Permissions(['deleteTask'])
  remove(@Param('id') id: string) {
    return this.taskService.remove(+id);
  }

  @MessagePattern({ cmd: 'get_dashboard_tasks' })
  findTasksWithDashboardId(data: { id: number }): Promise<Task[]> {
    return this.taskService.findTasksWithDashboardId(data.id);
  }
}
