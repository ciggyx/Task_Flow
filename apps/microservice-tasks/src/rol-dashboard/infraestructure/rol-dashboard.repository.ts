import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRolDashboardDto } from '../dto/create-rol-dashboard.dto';
import { RolDashboard } from '../entities/rol-dashboard.entity';
import { IRolDashboardRepository } from './rol-dashboard.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UpdateDashboardDto } from 'src/dashboard/dto/update-dashboard.dto';
import { ParticipantType } from 'src/participant-type/entities/participant-type.entity';
import { Dashboard } from 'src/dashboard/entities/dashboard.entity';

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
    const participantTypes = await this.rolDashboardRepository.find({
      where: { idUser: userId },
      relations: {
        participantTypeId: true,
        dashboardId: true,
      },
    });

    return participantTypes.filter(
      (rolDashboard) => rolDashboard.participantTypeId.id === participantType.id,
    );
  }

  findSharedByUserId(userId: number, participantTypes: number[]): Promise<RolDashboard[]> {
    return this.rolDashboardRepository.find({
      where: { idUser: userId, participantTypeId: In(participantTypes) },
      relations: {
        participantTypeId: true,
        dashboardId: true,
      },
    });
  }

  async findUsersInDashboard(idDashboard: Dashboard): Promise<number[]> {
    const usersInDashboard = await this.rolDashboardRepository.find({
      where: { dashboardId: idDashboard },
    });

    return usersInDashboard.map((u) => u.idUser);
  }
}
