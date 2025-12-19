import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RolDashboard } from './entities/rol-dashboard.entity';
import { CreateRolDashboardDto } from './dto/create-rol-dashboard.dto';
import { UpdateRolDashboardDto } from './dto/update-rol-dashboard.dto';
import { IRolDashboardRepository } from './infraestructure/rol-dashboard.interface';
import { IDashboardRepository } from '@microservice-tasks/dashboard/infraestructure/dashboard.interface';
import { IParticipantTypeRepository } from '@microservice-tasks/participant-type/infraestructure/participant-type.interface';

@Injectable()
export class RolDashboardService {
  constructor(
    @Inject('IRolDashboardRepository')
    private readonly rolDashboardRepository: IRolDashboardRepository,

    @Inject('IDashboardRepository')
    private readonly dashboardRepository: IDashboardRepository,

    @Inject('IParticipantTypeRepository')
    private readonly participantTypeRepository: IParticipantTypeRepository,
  ) { }

  async create(createRolDashboardDto: CreateRolDashboardDto): Promise<RolDashboard> {
    const dashboardExists = await this.dashboardRepository.findOne(
      createRolDashboardDto.dashboard.id,
    );
    if (!dashboardExists) {
      throw new NotFoundException(
        `Dashboard with ID ${createRolDashboardDto.dashboard} was not found.`,
      );
    }

    const roleExists = await this.participantTypeRepository.findOne(createRolDashboardDto.participantType.id);
    if (!roleExists) {
      throw new NotFoundException(
        `ParticipantType (Role) with ID ${createRolDashboardDto.participantType} was not found.`,
      );
    }

    return this.rolDashboardRepository.create(createRolDashboardDto);
  }

  async findAll(): Promise<RolDashboard[]> {
    return this.rolDashboardRepository.findAll();
  }

  async findOne(id: number): Promise<RolDashboard> {
    const rolDashboard = await this.rolDashboardRepository.findOne(id);

    if (!rolDashboard) {
      throw new NotFoundException(`RolDashboard with ID ${id} was not found.`);
    }

    return rolDashboard;
  }

  async update(id: number, updateRolDashboardDto: UpdateRolDashboardDto): Promise<RolDashboard> {
    const existingRolDashboard = await this.rolDashboardRepository.findOne(id);
    if (!existingRolDashboard) {
      throw new NotFoundException(`RolDashboard with ID ${id} was not found for update.`);
    }

    const updateObject: Partial<RolDashboard> = {};
    let shouldUpdate = false;

    if (updateRolDashboardDto.dashboard) {
      const dashboardExists = await this.dashboardRepository.findOne(
        updateRolDashboardDto.dashboard.id,
      );
      if (!dashboardExists) {
        throw new NotFoundException(
          `Dashboard with ID ${updateRolDashboardDto.dashboard} was not found.`,
        );
      }

      updateObject.dashboard = dashboardExists;

      shouldUpdate = true;
    }

    if (updateRolDashboardDto.participantType) {
      const roleExists = await this.participantTypeRepository.findOne(updateRolDashboardDto.participantType.id);
      if (!roleExists) {
        throw new NotFoundException(
          `ParticipantType (Role) with ID ${updateRolDashboardDto.participantType} was not found.`,
        );
      }
      updateObject.participantType = roleExists;
      shouldUpdate = true;
    }

    if (updateRolDashboardDto.idUser) {
      updateObject.userId = updateRolDashboardDto.idUser;
      shouldUpdate = true;
    }

    if (!shouldUpdate) {
      return existingRolDashboard;
    }

    const updatedRolDashboard = this.rolDashboardRepository.merge(
      existingRolDashboard,
      updateObject,
    );
    return this.rolDashboardRepository.save(updatedRolDashboard);
  }

  async remove(id: number): Promise<{ message: string, deletedId: number }> {
    await this.rolDashboardRepository.remove(id);
    return {
      message: `RolDashboard deleted successfully.`,
      deletedId: id,
    };
  }
}
