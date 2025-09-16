import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';
import { Priority } from 'src/priority/entities/priority.entity';
import { Status } from 'src/status/entities/status.entity';
import { Dashboard } from 'src/dashboard/entities/dashboard.entity';
import { TaskResponseDto } from './dto/response-task.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(Priority)
    private readonly priorityRepository: Repository<Priority>,

    @InjectRepository(Status)
    private readonly statusRepository: Repository<Status>,

    @InjectRepository(Dashboard)
    private readonly dashboardRepository: Repository<Dashboard>,
  ) {}
  async create(createTaskDto: CreateTaskDto): Promise<TaskResponseDto> {
    const { name, description, priorityId, endDate, statusId, dashboardId } =
      createTaskDto;

    const defaultStatusId = 2;

    const status = await this.statusRepository.findOneBy({
      id: statusId || defaultStatusId,
    });
    if (!status) {
      throw new NotFoundException(
        `Status with id ${statusId ?? defaultStatusId} not found`,
      );
    }

    let priority: Priority | undefined = undefined;
    if (priorityId) {
      const foundPriority = await this.priorityRepository.findOneBy({
        id: priorityId,
      });
      if (!foundPriority) {
        throw new NotFoundException(`Priority with id ${priorityId} not found`);
      }
      priority = foundPriority;
    }
    const dashboard = await this.dashboardRepository.findOneBy({
      id: dashboardId,
    });
    if (!dashboard) {
      throw new NotFoundException(`Dashboard with id ${dashboardId} not found`);
    }

    const task = this.taskRepository.create({
      name,
      description,
      endDate,
      startDate: new Date(),
      status,
      priority,
      dashboard,
    });

    return await this.taskRepository.save(task);
  }

  findAll(): Promise<Task[]> {
    // Aquí usamos 'select' para traer solo los campos que necesitas
    return this.taskRepository.find({
      relations: ['status', 'priority', 'dashboard'],
    });
  }

  findOne(id: number): Promise<Task | null> {
    // Usamos 'select' también para la búsqueda de un solo elemento
    return this.taskRepository.findOne({
      where: { id },
      relations: ['status', 'priority', 'dashboard'],
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updateTaskDto: UpdateTaskDto) {
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const taskExist = await this.taskRepository.findOne({ where: { id } });
    if (!taskExist) {
      throw new NotFoundException(`Task with ${id} not found`);
    }
    await this.taskRepository.delete(id);
  }
}
