import { InjectRepository } from '@nestjs/typeorm';
import { CreateDashboardDto } from '@shared/dtos';
import { Dashboard } from '../entities/dashboard.entity';
import { IDashboardRepository } from './dashboard.interface';
import { In, QueryFailedError, Repository } from 'typeorm';
import { UpdateDashboardDto } from '@shared/dtos';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { RolDashboard } from '@microservice-tasks/rol-dashboard/entities/rol-dashboard.entity';
import { RpcException } from '@nestjs/microservices';

export class DashboardRepository implements IDashboardRepository {
  constructor(
    @InjectRepository(Dashboard)
    private readonly dashboardRepository: Repository<Dashboard>,
  ) { }
  count(): Promise<number> {
    return this.dashboardRepository.count();
  }

  saveArray(dashboard: { name: string; description: string }[]): Promise<Dashboard[]> {
    return this.dashboardRepository.save(dashboard);
  }

  async findDashboardByRolDashboard(idDashboards: RolDashboard[]): Promise<Dashboard[]> {
    return await this.dashboardRepository.find({
      where: { id: In(idDashboards.map((r) => r.dashboard)) },
      relations: {
        task: false,
      },
    });
  }

  create(createDashboard: CreateDashboardDto): Promise<Dashboard> {
    const dashboard = this.dashboardRepository.create(createDashboard);
    return this.dashboardRepository.save(dashboard);
  }

  findAll(): Promise<Dashboard[]> {
    return this.dashboardRepository.find();
  }

  findOne(id: number): Promise<Dashboard | null> {
    return this.dashboardRepository.findOne({ where: { id } });
  }

  findOneWithTasks(id: number): Promise<Dashboard | null> {
    return this.dashboardRepository.findOne({
      where: { id },
      relations: ['tasks'],
    });
  }

  async update(id: number, updateDashboardDto: UpdateDashboardDto): Promise<Dashboard> {
    const dashboard = await this.dashboardRepository.preload({
      id,
      ...updateDashboardDto,
    });

    if (!dashboard) throw new NotFoundException(`Dashboard with ${id} not found`);

    return this.dashboardRepository.save(dashboard);
  }

  async remove(id: number): Promise<void> {
    await this.dashboardRepository.delete(id);
  }
}
