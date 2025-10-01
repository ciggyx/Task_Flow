import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { RolDashboard } from './entities/rol-dashboard.entity';
import { Dashboard } from 'src/dashboard/entities/dashboard.entity';
import { ParticipantType } from 'src/participant-type/entities/participant-type.entity';
import { CreateRolDashboardDto } from './dto/create-rol-dashboard.dto';
import { UpdateRolDashboardDto } from './dto/update-rol-dashboard.dto';

@Injectable()
export class RolDashboardService {
  // URL base de tu microservicio de usuarios (para futura implementación)
  private readonly userMicroserviceUrl = 'http://localhost:3001/usuarios';

  constructor(
    @InjectRepository(RolDashboard)
    private readonly rolDashboardRepository: Repository<RolDashboard>,
    @InjectRepository(Dashboard)
    private readonly dashboardRepository: Repository<Dashboard>,
    @InjectRepository(ParticipantType)
    private readonly participantTypeRepository: Repository<ParticipantType>,

    // Servicio HTTP para la comunicación con el microservicio de usuarios
    private readonly httpService: HttpService,
  ) {}

  async create(
    createRolDashboardDto: CreateRolDashboardDto,
  ): Promise<RolDashboard> {
    const { idDashboard, idRol, idUser } = createRolDashboardDto;

    const dashboardExists = await this.dashboardRepository.findOneBy({
      id: idDashboard,
    });
    if (!dashboardExists) {
      throw new NotFoundException(
        `Dashboard con ID ${idDashboard} no encontrado`,
      );
    }

    const rolExists = await this.participantTypeRepository.findOneBy({
      id: idRol,
    });
    if (!rolExists) {
      throw new NotFoundException(
        `ParticipantType (Rol) con ID ${idRol} no encontrado`,
      );
    }

    const newRolDashboard = this.rolDashboardRepository.create({
      // Se pasa el ID a la propiedad de relación como objeto parcial
      dashboardId: { id: idDashboard } as Dashboard,
      participantTypeId: { id: idRol } as ParticipantType,
      idUser,
    });

    return this.rolDashboardRepository.save(newRolDashboard);
  }

  async findAll(): Promise<RolDashboard[]> {
    return this.rolDashboardRepository.find({
      relations: ['dashboardId', 'participantTypeId'],
    });
  }

  async findOne(id: number): Promise<RolDashboard> {
    const rolDashboard = await this.rolDashboardRepository.findOne({
      where: { id },
      relations: ['dashboardId', 'participantTypeId'],
    });

    if (!rolDashboard) {
      throw new NotFoundException(
        `Relación RolDashboard con ID ${id} no encontrada`,
      );
    }
    return rolDashboard;
  }

  async update(
    id: number,
    updateRolDashboardDto: UpdateRolDashboardDto,
  ): Promise<RolDashboard> {
    const existingRolDashboard = await this.rolDashboardRepository.findOneBy({
      id,
    });
    if (!existingRolDashboard) {
      throw new NotFoundException(
        `Relación RolDashboard con ID ${id} no encontrada para actualizar`,
      );
    }

    const updateObject: any = {};
    let shouldUpdate = false;

    if (updateRolDashboardDto.idDashboard) {
      const dashboardExists = await this.dashboardRepository.findOneBy({
        id: updateRolDashboardDto.idDashboard,
      });
      if (!dashboardExists) {
        throw new NotFoundException(
          `Dashboard con ID ${updateRolDashboardDto.idDashboard} no encontrado`,
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      updateObject.dashboardId = {
        id: updateRolDashboardDto.idDashboard,
      } as Dashboard;
      shouldUpdate = true;
    }

    if (updateRolDashboardDto.idRol) {
      const rolExists = await this.participantTypeRepository.findOneBy({
        id: updateRolDashboardDto.idRol,
      });
      if (!rolExists) {
        throw new NotFoundException(
          `ParticipantType (Rol) con ID ${updateRolDashboardDto.idRol} no encontrado`,
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      updateObject.participantTypeId = {
        id: updateRolDashboardDto.idRol,
      } as ParticipantType;
      shouldUpdate = true;
    }

    if (updateRolDashboardDto.idUser) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      updateObject.idUser = updateRolDashboardDto.idUser;
      shouldUpdate = true;
    }

    if (!shouldUpdate) {
      return existingRolDashboard;
    }

    const updatedRolDashboard = this.rolDashboardRepository.merge(
      existingRolDashboard,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      updateObject,
    );
    return this.rolDashboardRepository.save(updatedRolDashboard);
  }
  async remove(id: number): Promise<{ message: string }> {
    const result = await this.rolDashboardRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(
        `Relación RolDashboard con ID ${id} no encontrada para eliminar`,
      );
    }

    return {
      message: `Relación RolDashboard con ID ${id} eliminada exitosamente`,
    };
  }
}
