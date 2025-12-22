import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Dashboard } from '@microservice-tasks/dashboard/entities/dashboard.entity';
import { ParticipantType } from '@microservice-tasks/participant-type/entities/participant-type.entity';
import { UpdateDashboardDto } from '@shared/dtos';
import { IRolDashboardRepository } from '@microservice-tasks/core/ports/rol-dashboard.interface';
import { RolDashboard } from '@microservice-tasks/rol-dashboard/entities/rol-dashboard.entity';
import { CreateRolDashboardDto } from '@microservice-tasks/rol-dashboard/dto/create-rol-dashboard.dto';

@Injectable()
export class RolDashboardRepository implements IRolDashboardRepository {
  constructor(
    @InjectRepository(RolDashboard)
    private readonly rolDashboardRepository: Repository<RolDashboard>,
  ) { }

  async updateUserInDashboard(rolDashboard: Partial<RolDashboard>): Promise<RolDashboard> {
    return await this.rolDashboardRepository.save(rolDashboard)
  }

  saveArray(
    rolDashboard: {
      dashboard: Dashboard;
      participantType: ParticipantType;
      userId: number;
    }[],
  ): Promise<RolDashboard[]> {
    return this.rolDashboardRepository.save(rolDashboard);
  }

  count(): Promise<number> {
    return this.rolDashboardRepository.count();
  }

  merge(existingRolDashboard: RolDashboard, updateObject: Partial<RolDashboard>): RolDashboard {
    return this.rolDashboardRepository.merge(existingRolDashboard, updateObject);
  }
  async create(createRolDashboardDto: CreateRolDashboardDto): Promise<RolDashboard> {
    const rolDashboard = this.rolDashboardRepository.create(createRolDashboardDto);

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
    if (!rolDashboard) throw new NotFoundException(`RolDashboard with id: ${id} not found.`);
    return this.rolDashboardRepository.save(rolDashboard);
  }

  async remove(id: number): Promise<void> {
    await this.rolDashboardRepository.delete(id);
  }

  save(rolDashboard: RolDashboard): Promise<RolDashboard> {
    return this.rolDashboardRepository.save(rolDashboard);
  }

  async findOwnedByUserId(
    userId: number,
    participantType: ParticipantType,
  ): Promise<RolDashboard[]> {
    const roles = await this.rolDashboardRepository.find({
      where: {
        userId: userId,
        participantType: participantType
      },
      relations: {
        dashboard: true,
        participantType: true,
      },
    });

    return roles;
  }

  // Obtener dashboards compartidos (otros tipos de roles)
  findSharedByUserId(userId: number, participantTypes: number[]): Promise<RolDashboard[]> {
    return this.rolDashboardRepository.find({
      where: {
        userId: userId,
        participantType: In(participantTypes)
      },
    });
  }

  // Obtener ids de usuarios en un dashboard
  async findUsersInDashboard(dashboard: Dashboard): Promise<number[]> {
    const usersInDashboard = await this.rolDashboardRepository.find({
      where: { dashboard: dashboard },
    });

    return usersInDashboard.map((u) => u.userId);
  }
}
