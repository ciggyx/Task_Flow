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
    return await this.taskRepository.save(foundTask);
  }
}
