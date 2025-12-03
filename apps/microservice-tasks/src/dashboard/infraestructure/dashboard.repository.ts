import { InjectRepository } from '@nestjs/typeorm';
import { CreateDashboardDto } from '../dto/create-dashboard.dto';
import { Dashboard } from '../entities/dashboard.entity';
import { IDashboardRepository } from './dashboard.interface';
import { In, Repository } from 'typeorm';
import { UpdateDashboardDto } from '../dto/update-dashboard.dto';
import { NotFoundException } from '@nestjs/common';
import { RolDashboard } from '@microservice-tasks/rol-dashboard/entities/rol-dashboard.entity';

export class DashboardRepository implements IDashboardRepository {
  constructor(
    @InjectRepository(Dashboard)
    private readonly dashboardRepository: Repository<Dashboard>,
  ) {}
  count(): Promise<number> {
    return this.dashboardRepository.count();
  }

  saveArray(dashboard: { name: string; description: string }[]): Promise<Dashboard[]> {
    return this.dashboardRepository.save(dashboard);
  }

  async findDashboardByRolDashboard(idDashboards: RolDashboard[]): Promise<Dashboard[]> {
    return await this.dashboardRepository.find({
      where: { id: In(idDashboards.map((r) => r.dashboardId.id)) },
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
