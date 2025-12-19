import { InjectRepository } from '@nestjs/typeorm';
import { CreateDashboardDto } from '@shared/dtos';
import { Dashboard } from '../entities/dashboard.entity';
import { IDashboardRepository } from './dashboard.interface';
import { In, Repository } from 'typeorm';
import { UpdateDashboardDto } from '@shared/dtos';
import { NotFoundException } from '@nestjs/common';
import { RolDashboard } from '@microservice-tasks/rol-dashboard/entities/rol-dashboard.entity';

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
      where: { id: In(idDashboards.map((r) => r.dashboard.id)) },
      relations: {
        task: false,
      },
    });
  }

  async create(createDashboard: CreateDashboardDto): Promise<Dashboard> {
    const dashboard = this.dashboardRepository.create(createDashboard);
    return await this.dashboardRepository.save(dashboard);
  }

  findAll(): Promise<Dashboard[]> {
    return this.dashboardRepository.find();
  }

  async findOne(id: number): Promise<Dashboard> {
    const dashboard = await this.dashboardRepository.findOne({ where: { id } });
    if (!dashboard) {
      throw new NotFoundException(`Dashboard with id: ${id} not found`);
    }
    return dashboard;
  }

  findOneWithTasks(id: number): Promise<Dashboard | null> {
    return this.dashboardRepository.findOne({
      where: { id },
      relations: ['tasks'],
    });
  }

  async update(updateDashboardDto: UpdateDashboardDto, id: number): Promise<Dashboard> {
    const dashboard = await this.dashboardRepository.preload({
      id,
      ...updateDashboardDto,
    });

    if (!dashboard) throw new NotFoundException(`Dashboard with id: ${id} not found`);

    return this.dashboardRepository.save(dashboard);
  }

  async remove(id: number): Promise<void> {
    await this.dashboardRepository.delete(id);
  }
}
