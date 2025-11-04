import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRolDashboardDto } from '../dto/create-rol-dashboard.dto';
import { RolDashboard } from '../entities/rol-dashboard.entity';
import { IRolDashboardRepository } from './rol-dashboard.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateDashboardDto } from 'src/dashboard/dto/update-dashboard.dto';

@Injectable()
export class RolDashboardRepository implements IRolDashboardRepository {
  constructor(
    @InjectRepository(RolDashboard)
    private readonly rolDashboardRepository: Repository<RolDashboard>,
  ) {}

  merge(
    existingRolDashboard: RolDashboard,
    updateObject: Partial<RolDashboard>,
  ): RolDashboard {
    return this.rolDashboardRepository.merge(
      existingRolDashboard,
      updateObject,
    );
  }
  async create(
    createRolDashboardDto: CreateRolDashboardDto,
  ): Promise<RolDashboard> {
    const rolDashboard = this.rolDashboardRepository.create(
      createRolDashboardDto,
    );

    return await this.rolDashboardRepository.save(rolDashboard);
  }

  findAll(): Promise<RolDashboard[]> {
    return this.rolDashboardRepository.find({
      relations: ['dashboardId', 'participantTypeId'],
    });
  }

  findOne(id: number): Promise<RolDashboard | null> {
    return this.rolDashboardRepository.findOne({
      where: { id },
      relations: ['dashboardId', 'participantTypeId'],
    });
  }

  async update(
    id: number,
    updateRolDashboardDto: UpdateDashboardDto,
  ): Promise<RolDashboard | null> {
    const rolDashboard = await this.rolDashboardRepository.preload({
      id,
      ...updateRolDashboardDto,
    });
    if (!rolDashboard)
      throw new NotFoundException(`RolDashboard with id: ${id} not found.`);
    return this.rolDashboardRepository.save(rolDashboard);
  }

  async remove(id: number): Promise<void> {
    await this.rolDashboardRepository.delete(id);
  }

  save(rolDashboard: RolDashboard): Promise<RolDashboard> {
    return this.rolDashboardRepository.save(rolDashboard);
  }
}
