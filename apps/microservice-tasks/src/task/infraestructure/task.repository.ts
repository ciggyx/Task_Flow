import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';
import { ITaskRepository } from './task.interface';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { TaskResponseDto } from '../dto/response-task.dto';
import { Dashboard } from 'src/dashboard/entities/dashboard.entity';
import { Priority } from 'src/priority/entities/priority.entity';
import { Status } from 'src/status/entities/status.entity';

@Injectable()
export class TaskRepository implements ITaskRepository {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  count(): Promise<number> {
    return this.taskRepository.count();
  }

  saveArray(
    task: {
      name: string;
      description: string;
      startDate: Date;
      endDate: Date;
      status: Status;
      priority: Priority;
      dashboard: Dashboard;
    }[],
  ): Promise<Task[]> {
    return this.taskRepository.save(task);
  }

  create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepository.create(createTaskDto);
    return this.taskRepository.save(task);
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.taskRepository.preload({
      id,
      ...updateTaskDto,
    });

    if (!task) throw new NotFoundException('Task not found');
    return this.taskRepository.save(task);
  }

  async updateOnlyStatus(id: number, statusId: number): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    return await this.taskRepository.save({
      ...task,
      statusId,
    });
  }

  async updateOnlyPriority(id: number, priorityId: number): Promise<TaskResponseDto> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    return await this.taskRepository.save({
      ...task,
      priorityId,
    });
  }

  async remove(id: number): Promise<string> {
    await this.taskRepository.delete(id);
    return `Task deleted succesfully`;
  }

  findAll(): Promise<Task[]> {
    return this.taskRepository.find({
      relations: ['status', 'priority', 'dashboard'],
    });
  }

  async findOne(id: number): Promise<Task | null> {
    return this.taskRepository.findOne({
      where: { id },
      relations: ['status', 'priority', 'dashboard'],
    });
  }

  async save(task: Task): Promise<Task> {
    return this.taskRepository.save(task);
  }

  findAllWithStatusId(id: number): Promise<Task[]> {
    return this.taskRepository.find({ where: { statusId: id } });
  }

  findAllWithDashboardId(id: number): Promise<Task[]> {
    return this.taskRepository.find({ where: { dashboardId: id } });
  }

  findAllWithPriorityId(id: number): Promise<Task[]> {
    return this.taskRepository.find({ where: { priorityId: id } });
  }
}
