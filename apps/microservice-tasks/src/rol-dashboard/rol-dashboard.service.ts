import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RolDashboard } from './entities/rol-dashboard.entity';
import { CreateRolDashboardDto } from './dto/create-rol-dashboard.dto';
import { UpdateRolDashboardDto } from './dto/update-rol-dashboard.dto';
import { DASHBOARD_REPO, PARTICIPANT_TYPE_REPO, ROL_DASHBOARD_REPO } from '@microservice-tasks/core/ports/tokens';
import { DashboardUserRelation, IRolDashboardRepository } from '@microservice-tasks/core/ports/rol-dashboard.interface';
import { IDashboardRepository } from '@microservice-tasks/core/ports/dashboard.interface';
import { IParticipantTypeRepository } from '@microservice-tasks/core/ports/participant-type.interface';
import { AuthorizationService } from '@microservice-tasks/authorization/authorization.service';
import { Dashboard } from '@microservice-tasks/dashboard/entities/dashboard.entity';

@Injectable()
export class RolDashboardService {
  constructor(
    @Inject(ROL_DASHBOARD_REPO)
    private readonly rolDashboardRepository: IRolDashboardRepository,

    @Inject(DASHBOARD_REPO)
    private readonly dashboardRepository: IDashboardRepository,

    @Inject(PARTICIPANT_TYPE_REPO)
    private readonly participantTypeRepository: IParticipantTypeRepository,

    private readonly authorizationService: AuthorizationService,
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

  async removeUser(dashboardId: number, userId : number, deleterId:number): Promise<{success : boolean}>{
    await this.authorizationService.canManageMembers(deleterId, dashboardId)
    await this.rolDashboardRepository.removeUser(dashboardId, userId)
    return { success: true }
  }

  async updateUserRole(dashboardId: number, userId : number, updaterId:number, newRoleId:number): Promise<RolDashboard>{
    await this.authorizationService.canManageMembers(updaterId, dashboardId)
    console.log(dashboardId, userId , updaterId, newRoleId)
    return await this.rolDashboardRepository.updateUserRole(userId, dashboardId, newRoleId)
  }


  async findUsersInDashboard(dashboardId: number): Promise<number[]>{
    const dashboard = await this.dashboardRepository.findOne(dashboardId);
    if (!dashboard){
      throw new NotFoundException('Dashboard not found');
    }
    const userIds= await this.rolDashboardRepository.findUsersInDashboard(dashboardId)
    return userIds;
  }

  async findUsersInDashboardWithRoles(dashboardId: number): Promise<DashboardUserRelation[]> {
  
    const dashboard = await this.dashboardRepository.findOne(dashboardId); 
    
    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    const usersWithRoles = await this.rolDashboardRepository.findUsersInDashboardWithRoles(dashboardId);
    
    return usersWithRoles;
  }

    async findOwned(userId: number): Promise<Dashboard[]> {
      const userRol = await this.participantTypeRepository.findOneByName('Owner');
      if (!userRol) {
        throw new NotFoundException(`User Rol with name: Owner not found`);
      }
      const idDashboardsOwned = await this.rolDashboardRepository.findOwnedByUserId(userId, userRol);
  
      return await this.dashboardRepository.findDashboardByRolDashboard(idDashboardsOwned);
    }
  
    async findShared(userId: number): Promise<Dashboard[]> {
      const userRoles = (await this.participantTypeRepository.findAll())
        .filter((p) => p.name !== 'Owner')
        .map((p) => p.id);
      if (!userRoles) {
        throw new NotFoundException(`User Roles not found, please run npm run seed`);
      }
      const idDashboardsShared = await this.rolDashboardRepository.findSharedByUserId(
        userId,
        userRoles,
      );
  
      return this.dashboardRepository.findDashboardByRolDashboard(idDashboardsShared);
    }
}
