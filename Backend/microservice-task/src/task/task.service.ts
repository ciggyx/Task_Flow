import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';
import { Priority } from 'src/priority/entities/priority.entity';
import { Dashboard } from 'src/dashboard/entities/dashboard.entity';
import { TaskResponseDto } from './dto/response-task.dto';
import { ITaskRepository } from './infraestructure/task.interface';
import { IStatusRepository } from 'src/status/infraestructure/status.interface';

@Injectable()
export class TaskService {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,

    @InjectRepository(Priority)
    private readonly priorityRepository: Repository<Priority>,

    @Inject('IStatusRepository')
    private readonly statusRepository: IStatusRepository,

    @InjectRepository(Dashboard)
    private readonly dashboardRepository: Repository<Dashboard>,
  ) {}
  async create(createTaskDto: CreateTaskDto): Promise<TaskResponseDto> {
    const { name, description, priorityId, endDate, statusId, dashboardId } =
      createTaskDto;

    const defaultStatusId = 2;

    const status = await this.statusRepository.findOne(
      statusId || defaultStatusId,
    );
    if (!status) {
      throw new NotFoundException(
        `Status with id ${statusId ?? defaultStatusId} not found`,
      );
    }

    if (priorityId) {
      const foundPriority = await this.priorityRepository.findOneBy({
        id: priorityId,
      });
      if (!foundPriority) {
        throw new NotFoundException(`Priority with id ${priorityId} not found`);
      }
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
      statusId,
      priorityId,
      dashboardId,
    });

    return await this.taskRepository.save(task);
  }

  findAll(): Promise<Task[]> {
    return this.taskRepository.findAll();
  }

  findOne(id: number): Promise<Task | null> {
    return this.taskRepository.findOne(id);
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    return this.taskRepository.update(id, updateTaskDto);
  }

  async remove(id: number): Promise<void> {
    const taskExist = await this.taskRepository.findOne(id);
    if (!taskExist) {
      throw new NotFoundException(`Task with ${id} not found`);
    }
    await this.taskRepository.remove(id);
  }
}
