import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RolDashboard } from './entities/rol-dashboard.entity';
import { Dashboard } from 'src/dashboard/entities/dashboard.entity';
import { ParticipantType } from 'src/participant-type/entities/participant-type.entity';
import { CreateRolDashboardDto } from './dto/create-rol-dashboard.dto';
import { UpdateRolDashboardDto } from './dto/update-rol-dashboard.dto';
import { IDashboardRepository } from 'src/dashboard/infraestructure/dashboard.interface';
import { IRolDashboardRepository } from './infraestructure/rol-dashboard.interface';
import { DeleteDashboardDto } from 'src/dashboard/dto/delete-dashboard.dto';
import { IParticipantTypeRepository } from 'src/participant-type/infraestructure/participant-type.interface';

@Injectable()
export class RolDashboardService {
  constructor(
    @Inject('IRolDashboardRepository')
    private readonly rolDashboardRepository: IRolDashboardRepository,

    @Inject('IDashboardRepository')
    private readonly dashboardRepository: IDashboardRepository,

    @Inject('IParticipantTypeRepository')
    private readonly participantTypeRepository: IParticipantTypeRepository,
  ) {}

  async create(
    createRolDashboardDto: CreateRolDashboardDto,
  ): Promise<RolDashboard> {
    const dashboardExists = await this.dashboardRepository.findOne(
      createRolDashboardDto.idDashboard,
    );
    if (!dashboardExists) {
      throw new NotFoundException(
        `Dashboard with ID ${createRolDashboardDto.idDashboard} was not found.`,
      );
    }

    const roleExists = await this.participantTypeRepository.findOne(
      createRolDashboardDto.idRol,
    );
    if (!roleExists) {
      throw new NotFoundException(
        `ParticipantType (Role) with ID ${createRolDashboardDto.idRol} was not found.`,
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

  async update(
    id: number,
    updateRolDashboardDto: UpdateRolDashboardDto,
  ): Promise<RolDashboard> {
    const existingRolDashboard = await this.rolDashboardRepository.findOne(id);
    if (!existingRolDashboard) {
      throw new NotFoundException(
        `RolDashboard with ID ${id} was not found for update.`,
      );
    }

    const updateObject: Partial<RolDashboard> = {};
    let shouldUpdate = false;

    if (updateRolDashboardDto.idDashboard) {
      const dashboardExists = await this.dashboardRepository.findOne(
        updateRolDashboardDto.idDashboard,
      );
      if (!dashboardExists) {
        throw new NotFoundException(
          `Dashboard with ID ${updateRolDashboardDto.idDashboard} was not found.`,
        );
      }
      updateObject.dashboardId = {
        id: updateRolDashboardDto.idDashboard,
      } as Dashboard;
      shouldUpdate = true;
    }

    if (updateRolDashboardDto.idRol) {
      const roleExists = await this.participantTypeRepository.findOne(
        updateRolDashboardDto.idRol,
      );
      if (!roleExists) {
        throw new NotFoundException(
          `ParticipantType (Role) with ID ${updateRolDashboardDto.idRol} was not found.`,
        );
      }
      updateObject.participantTypeId = {
        id: updateRolDashboardDto.idRol,
      } as ParticipantType;
      shouldUpdate = true;
    }

    if (updateRolDashboardDto.idUser) {
      updateObject.idUser = updateRolDashboardDto.idUser;
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

  async remove(id: number): Promise<DeleteDashboardDto> {
    await this.rolDashboardRepository.remove(id);
    return {
      message: `RolDashboard deleted successfully.`,
      deletedId: id,
    };
  }
}
