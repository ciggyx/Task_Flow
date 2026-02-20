import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, Between, IsNull, LessThanOrEqual } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTaskDto } from '@shared/dtos';
import { UpdateTaskDto } from '@shared/dtos';
import { TaskResponseDto } from '@shared/dtos';
import { Status } from '@microservice-tasks/status/entities/status.entity';
import { Priority } from '@microservice-tasks/priority/entities/priority.entity';
import { Dashboard } from '@microservice-tasks/dashboard/entities/dashboard.entity';
import { ITaskRepository } from '@microservice-tasks/core/ports/task.interface';
import { Task } from '@microservice-tasks/task/entities/task.entity';
import { IRankableTask } from '@microservice-tasks/core/ports/rankeable-task.interface';

@Injectable()
export class TaskRepository implements ITaskRepository {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) { }

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

    if (!task) throw new NotFoundException(`Task with id: ${id} not found`);
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

  async remove(id: number): Promise<void> {
    const taskExist = await this.findOne(id);
    if (!taskExist) {
      throw new NotFoundException(`Task with id: ${id} not found`);
    }
    await this.taskRepository.delete(id);
    return;
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
    return this.taskRepository.find({ where: { dashboardId: id }, relations: ['images'] });
  }

  findAllWithPriorityId(id: number): Promise<Task[]> {
    return this.taskRepository.find({ where: { priorityId: id } });
  }
  async findDashboardActivity(startDate: Date, endDate: Date, dashboardId: number): Promise<Task[]> {
    return this.taskRepository.find({
      where: [
      { dashboard: { id: dashboardId }, startDate: Between(startDate, endDate) },
      // 2. Tareas que terminaron en el rango
      { dashboard: { id: dashboardId }, finishDate: Between(startDate, endDate) },
      // 3. Tareas que debían terminar en el rango
      { dashboard: { id: dashboardId }, endDate: Between(startDate, endDate) },
      // 4. Tareas que siguen abiertas (sin finishDate) pero se crearon antes o durante el rango
      { dashboard: { id: dashboardId }, finishDate: IsNull(), startDate: LessThanOrEqual(endDate) }
      ],
      relations: ['status', 'priority']
    });
  }
  findTasksStartingBetweenDatesByUser(startDate: Date, endDate: Date, userId: number): Promise<Task[]>{
    return this.taskRepository.find({
      where:{
        startDate: Between(startDate,endDate),
        assignedToUserId: userId
      },
      relations: ['status']
    })
  }
  // task.repository.ts
  async findOneForRanking(id: number): Promise<IRankableTask> {
    return await this.taskRepository.findOne({
      where: { id },
      // AQUÍ ESTÁ EL AHORRO: Solo traemos estas columnas
      select: {
        id: true,
        assignedToUserId: true,
        reviewedByUserId: true,
        dashboardId: true,
        endDate: true,
        finishDate: true,
        priority: {
          name: true, // Solo el nombre de la prioridad
        },
      },
      relations: ['priority'],
    });
  }
}
