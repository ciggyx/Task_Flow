import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from 'src/task/entities/task.entity';
import { Dashboard } from './entities/dashboard.entity';
import { AssignTaskDto } from './dto/assign-task.dto';
import { CreateTaskDto } from 'src/task/dto/create-task.dto';
import { Priority } from 'src/priority/entities/priority.entity';
import { ITaskRepository } from 'src/task/infraestructure/task.interface';
import { IStatusRepository } from 'src/status/infraestructure/status.interface';

@Injectable()
export class DashboardService {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,

    @InjectRepository(Dashboard)
    private readonly dashRepository: Repository<Dashboard>,

    @InjectRepository(Priority)
    private readonly priorityRepository: Repository<Priority>,

    @Inject('IStatusRepository')
    private readonly statusRepository: IStatusRepository,
  ) {}
  async create(dto: CreateDashboardDto) {
    const dashboard = this.dashRepository.create({
      name: dto.name,
      description: dto.description,
    });
    return this.dashRepository.save(dashboard);
  }
  async findAll() {
    return await this.dashRepository.find();
  }

  async findOne(id: number) {
    return await this.dashRepository.findOne({ where: { id } });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update(id: number, updateDashboardDto: UpdateDashboardDto) {
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const dashExist = await this.dashRepository.findOne({ where: { id } });
    if (!dashExist) {
      throw new NotFoundException(`Dashboard with ${id} not found`);
    }
    await this.dashRepository.delete(id);
  }
  async assignTask(assignTaskDto: AssignTaskDto) {
    const foundDashboard = await this.dashRepository.findOne({
      where: { id: assignTaskDto.dashboardId },
    });
    const foundTask = await this.taskRepository.findOne(assignTaskDto.taskId);
    if (!foundDashboard) {
      throw new NotFoundException(
        `Dashboard with ${assignTaskDto.dashboardId} not found`,
      );
    }
    if (!foundTask) {
      throw new NotFoundException(
        `Task with ${assignTaskDto.taskId} not found`,
      );
    }
    foundTask.dashboardId = assignTaskDto.dashboardId;
    return await this.taskRepository.save(foundTask);
  }

  async createAndAssignTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const { dashboardId, name, description, priorityId, endDate, statusId } =
      createTaskDto;

    const dashboard: Dashboard | null = await this.dashRepository.findOne({
      where: { id: dashboardId },
    });
    if (!dashboard) {
      throw new NotFoundException(`Dashboard with id ${dashboardId} not found`);
    }

    const defaultStatusId = 2 as const;
    const resolvedStatusId: number = statusId ?? defaultStatusId;

    const status = await this.statusRepository.findOne(resolvedStatusId);
    if (!status) {
      throw new NotFoundException(
        `Status with id ${resolvedStatusId} not found`,
      );
    }

    if (priorityId) {
      const foundPriority: Priority | null =
        await this.priorityRepository.findOne({
          where: { id: priorityId },
        });
      if (!foundPriority) {
        throw new NotFoundException(`Priority with id ${priorityId} not found`);
      }
    }

    const task: Task = this.taskRepository.create({
      name,
      description,
      endDate,
      startDate: new Date(),
      statusId,
      priorityId,
      dashboardId,
    });

    const savedTask: Task = await this.taskRepository.save(task);

    return {
      id: savedTask.id,
      name: savedTask.name,
      description: savedTask.description,
      startDate: savedTask.startDate,
      endDate: savedTask.endDate,
      finishDate: savedTask.finishDate,
      status: savedTask.status,
      priority: savedTask.priority,
      dashboard: {
        id: dashboard.id,
        name: dashboard.name,
        description: dashboard.description,
      },
    } as Task;
  }
}
