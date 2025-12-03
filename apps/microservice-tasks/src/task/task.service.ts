import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { TaskResponseDto } from './dto/response-task.dto';
import { ITaskRepository } from './infraestructure/task.interface';
import { IPriorityRepository } from '@microservice-tasks/priority/infraestructure/priority.interface';
import { IStatusRepository } from '@microservice-tasks/status/infraestructure/status.interface';
import { IDashboardRepository } from '@microservice-tasks/dashboard/infraestructure/dashboard.interface';

@Injectable()
export class TaskService {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,

    @Inject('IPriorityRepository')
    private readonly priorityRepository: IPriorityRepository,

    @Inject('IStatusRepository')
    private readonly statusRepository: IStatusRepository,

    @Inject('IDashboardRepository')
    private readonly dashboardRepository: IDashboardRepository,
  ) {}
  async create(createTaskDto: CreateTaskDto): Promise<TaskResponseDto> {
    const { name, description, priorityId, endDate, statusId, dashboardId } = createTaskDto;

    const defaultStatusId = 2;

    const status = await this.statusRepository.findOne(statusId || defaultStatusId);
    if (!status) {
      throw new NotFoundException(`Status with id ${statusId ?? defaultStatusId} not found`);
    }

    if (priorityId) {
      const foundPriority = await this.priorityRepository.findOne(priorityId);
      if (!foundPriority) {
        throw new NotFoundException(`Priority with id ${priorityId} not found`);
      }
    }

    const dashboard = await this.dashboardRepository.findOne(dashboardId);
    if (!dashboard) {
      throw new NotFoundException(`Dashboard with id ${dashboardId} not found`);
    }

    const task = await this.taskRepository.create({
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

  async findTasksWithDashboardId(dashboardId: number): Promise<Task[]> {
    return this.taskRepository.findAllWithDashboardId(dashboardId);
  }
}
