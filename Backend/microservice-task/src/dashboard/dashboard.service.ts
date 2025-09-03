import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from 'src/task/entities/task.entity';
import { Dashboard } from './entities/dashboard.entity';
import { AssignTaskDto } from './dto/assign-task.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(Dashboard)
    private readonly dashRepository: Repository<Dashboard>,
  ) {}
  async create(createDashboardDto: CreateDashboardDto) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { name, description, taskId } = createDashboardDto;

    // eslint-disable-next-line prefer-const, @typescript-eslint/no-unused-vars
    let task: Task | undefined = undefined;
    if (taskId) {
      const foundTask = await this.taskRepository.findOneBy({ id: taskId });
      if (!foundTask) {
        throw new NotFoundException(`Task with ${taskId} not found`);
      }
      task = foundTask;
    }
    const dashboard = this.dashRepository.create({
      name,
      description,
      task: task,
    });
    return await this.dashRepository.save(dashboard);
  }

  async findAll() {
    return await this.dashRepository.find();
  }

  async findOne(id: number) {
    return await this.taskRepository.findOne({ where: { id } });
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
    const foundTask = await this.taskRepository.findOne({
      where: { id: assignTaskDto.taskId },
    });
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
    foundTask.dashboard = foundDashboard;
    return await this.taskRepository.save(foundTask);
  }
}
