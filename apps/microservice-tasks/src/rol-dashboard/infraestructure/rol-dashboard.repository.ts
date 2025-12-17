import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRolDashboardDto } from '../dto/create-rol-dashboard.dto';
import { RolDashboard } from '../entities/rol-dashboard.entity';
import { IRolDashboardRepository } from './rol-dashboard.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Dashboard } from '@microservice-tasks/dashboard/entities/dashboard.entity';
import { ParticipantType } from '@microservice-tasks/participant-type/entities/participant-type.entity';
import { UpdateDashboardDto } from '@shared/dtos';

@Injectable()
export class RolDashboardRepository implements IRolDashboardRepository {
  constructor(
    @InjectRepository(RolDashboard)
    private readonly rolDashboardRepository: Repository<RolDashboard>,
  ) {}

  saveArray(
  rolDashboard: {
    dashboardId: Dashboard;
    participantTypeId: ParticipantType;
    idUser: number;
  }[],
): Promise<RolDashboard[]> {
  // Mapear para convertir dashboardId y participantTypeId a números
  const rolDashboardToSave = rolDashboard.map((r) => ({
    idUser: r.idUser,
    dashboardId: r.dashboardId.id,       // solo el id
    participantTypeId: r.participantTypeId.id, // solo el id
  }));

  return this.rolDashboardRepository.save(rolDashboardToSave);
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
        idUser: userId,
        participantTypeId: participantType.id  // ahora solo el id
      },
    });

    return roles;
  }

  // Obtener dashboards compartidos (otros tipos de roles)
  findSharedByUserId(userId: number, participantTypes: number[]): Promise<RolDashboard[]> {
    return this.rolDashboardRepository.find({
      where: { 
        idUser: userId, 
        participantTypeId: In(participantTypes)  // solo ids
      },
    });
  }

  // Obtener ids de usuarios en un dashboard
  async findUsersInDashboard(idDashboard: number): Promise<number[]> {
    const usersInDashboard = await this.rolDashboardRepository.find({
      where: { dashboardId: idDashboard },  // solo el id
    });

    return usersInDashboard.map((u) => u.idUser);
  }
}
