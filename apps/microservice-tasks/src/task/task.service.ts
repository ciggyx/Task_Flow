import { HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from '@shared/dtos';
import { UpdateTaskDto } from '@shared/dtos';
import { Task } from './entities/task.entity';
import { TaskResponseDto } from '@shared/dtos';
import { RpcException } from '@nestjs/microservices';
import { Status } from '@microservice-tasks/status/entities/status.entity';
import { Priority } from '@microservice-tasks/priority/entities/priority.entity';
import { DASHBOARD_REPO, PRIORITY_REPO, STATUS_REPO, TASK_REPO } from '@microservice-tasks/core/ports/tokens';
import { ITaskRepository } from '@microservice-tasks/core/ports/task.interface';
import { IPriorityRepository } from '@microservice-tasks/core/ports/priority.interface';
import { IStatusRepository } from '@microservice-tasks/core/ports/status.interface';
import { IDashboardRepository } from '@microservice-tasks/core/ports/dashboard.interface';

@Injectable()
export class TaskService {
  constructor(
    @Inject(TASK_REPO)
    private readonly taskRepository: ITaskRepository,

    @Inject(PRIORITY_REPO)
    private readonly priorityRepository: IPriorityRepository,

    @Inject(STATUS_REPO)
    private readonly statusRepository: IStatusRepository,

    @Inject(DASHBOARD_REPO)
    private readonly dashboardRepository: IDashboardRepository,
  ) { }
  async create(createTaskDto: CreateTaskDto): Promise<TaskResponseDto> {
    const { name, description, priorityId, endDate, statusId, dashboardId } = createTaskDto;

    let statusTask: Status;

    if (statusId) {
      statusTask = await this.statusRepository.findOne(statusId);
    } else {
      statusTask = await this.statusRepository.findOneByName('Pendiente');
    };

    if (!statusTask) {
      throw new RpcException({
        message: `Status not found. Please run seed.`,
        status: HttpStatus.NOT_FOUND
      });
    }

    let priority: Priority;
    if (priorityId) {
      priority = await this.priorityRepository.findOne(priorityId);
    } else {
      priority = await this.priorityRepository.findOneByName('Undefined');
    }

    if (!priority) {
      throw new RpcException({
        message: `Priority not found. Please run seed`,
        status: HttpStatus.NOT_FOUND
      })
    }

    try {
      const dashboard = await this.dashboardRepository.findOne(dashboardId);
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        error: error.response.error,
        message: error.response.message
      })
    }

    const task = await this.taskRepository.create({
      name,
      description,
      endDate,
      startDate: new Date(),
      statusId: statusTask.id,
      priorityId: priority.id,
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

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    try {
      return await this.taskRepository.update(id, updateTaskDto);
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        error: error.response.error,
        message: error.response.message
      })
    }
  }

  async remove(id: number): Promise<void> {
    try {
      return await this.taskRepository.remove(id);
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        error: error.response.error,
        message: error.response.message
      })
    }
  }

  async findTasksWithDashboardId(dashboardId: number): Promise<Task[]> {
    return this.taskRepository.findAllWithDashboardId(dashboardId);
  }
}
