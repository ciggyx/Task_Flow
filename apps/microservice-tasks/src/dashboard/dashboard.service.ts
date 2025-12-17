import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDashboardDto } from '../../../../libs/shared/dtos/src/lib/dashboard/create-dashboard.dto';
import { UpdateDashboardDto } from '../../../../libs/shared/dtos/src/lib/dashboard/update-dashboard.dto';
import { Dashboard } from './entities/dashboard.entity';
import { AssignTaskDto } from './dto/assign-task.dto';
import { DeleteDashboardDto } from '../../../../libs/shared/dtos/src/lib/dashboard/delete-dashboard.dto';
import { ITaskRepository } from '@microservice-tasks/task/infraestructure/task.interface';
import { IDashboardRepository } from './infraestructure/dashboard.interface';
import { IPriorityRepository } from '@microservice-tasks/priority/infraestructure/priority.interface';
import { IStatusRepository } from '@microservice-tasks/status/infraestructure/status.interface';
import { IParticipantTypeRepository } from '@microservice-tasks/participant-type/infraestructure/participant-type.interface';
import { IRolDashboardRepository } from '@microservice-tasks/rol-dashboard/infraestructure/rol-dashboard.interface';
import { CreateTaskDto } from '@microservice-tasks/task/dto/create-task.dto';
import { DashboardInvitationDto } from './dto/dashboard-invitation.dto';
import { Task } from '@microservice-tasks/task/entities/task.entity';
import { Priority } from '@microservice-tasks/priority/entities/priority.entity';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class DashboardService {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,

    @Inject('IDashboardRepository')
    private readonly dashboardRepository: IDashboardRepository,

    @Inject('IPriorityRepository')
    private readonly priorityRepository: IPriorityRepository,

    @Inject('IStatusRepository')
    private readonly statusRepository: IStatusRepository,

    @Inject('IParticipantTypeRepository')
    private readonly participantTypeRepository: IParticipantTypeRepository,

    @Inject('IRolDashboardRepository')
    private readonly rolDashboardRepository: IRolDashboardRepository,
    @Inject('GATEWAY_CLIENT')
    private readonly gatewayClient: ClientProxy,
  ) {}

  create(dto: CreateDashboardDto): Promise<Dashboard> {
    return this.dashboardRepository.create({
      name: dto.name,
      description: dto.description,
    });
  }
  async findAll(): Promise<Dashboard[]> {
    return await this.dashboardRepository.findAll();
  }

  async findOne(id: number): Promise<Dashboard | null> {
    return await this.dashboardRepository.findOne(id);
  }

  async update(id: number, updateDashboardDto: UpdateDashboardDto): Promise<Dashboard | null> {
    return await this.dashboardRepository.update(id, updateDashboardDto);
  }

  // Ver que hacer con esto, si devolver un message y el id o nada...
  // async remove(id: number): Promise<DeleteDashboardDto> {
  async remove(id: number): Promise<{message: string, deletedId: number}> {
    const dashExist = await this.dashboardRepository.findOne(id);
    if (!dashExist) throw new NotFoundException(`Dashboard with ${id} not found`);

    await this.dashboardRepository.remove(id);
    return { message: 'Dashboard deleted succesfully', deletedId: id };
  }

  async assignTask(assignTaskDto: AssignTaskDto) {
    const foundDashboard = await this.dashboardRepository.findOne(assignTaskDto.dashboardId);
    const foundTask = await this.taskRepository.findOne(assignTaskDto.taskId);
    if (!foundDashboard) {
      throw new NotFoundException(`Dashboard with ${assignTaskDto.dashboardId} not found`);
    }
    if (!foundTask) {
      throw new NotFoundException(`Task with ${assignTaskDto.taskId} not found`);
    }
    foundTask.dashboardId = assignTaskDto.dashboardId;
    return await this.taskRepository.save(foundTask);
  }

  async createAndAssignTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const { dashboardId, name, description, priorityId, endDate, statusId } = createTaskDto;

    const dashboard = await this.dashboardRepository.findOne(dashboardId);
    if (!dashboard) {
      throw new NotFoundException(`Dashboard with id ${dashboardId} not found`);
    }

    const defaultStatusId = 2;
    const resolvedStatusId: number = statusId ?? defaultStatusId;

    const status = await this.statusRepository.findOne(resolvedStatusId);
    if (!status) {
      throw new NotFoundException(`Status with id ${resolvedStatusId} not found`);
    }

    if (priorityId) {
      const foundPriority: Priority | null = await this.priorityRepository.findOne(priorityId);
      if (!foundPriority) {
        throw new NotFoundException(`Priority with id ${priorityId} not found`);
      }
    }

    const task = await this.taskRepository.create({
      name,
      description,
      endDate,
      startDate: new Date(),
      statusId,
      priorityId,
      dashboardId,
    });

    const savedTask = await this.taskRepository.save(task);

    return {
      id: savedTask.id,
      name: savedTask.name,
      description: savedTask.description,
      startDate: savedTask.startDate,
      endDate: savedTask.endDate,
      finishDate: savedTask.finishDate,
      status: savedTask.status,
      priority: savedTask.priority,
      dashboard: {
        id: dashboard.id,
        name: dashboard.name,
        description: dashboard.description,
      },
    } as Task;
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

  async findUsersInDashboard(id: number): Promise<number[]> {
      const dashboard = await this.dashboardRepository.findOne(id);

      if (!dashboard) {
        throw new NotFoundException(`Dashboard with ID: ${id} not found`);
      }

      return this.rolDashboardRepository.findUsersInDashboard(dashboard.id);
    }
  async processDashboardInvitation(data: DashboardInvitationDto) {

    const { to, invitedBy, dashboardId } = data;

    // 1. Verificar que el dashboard exista
    const dashboard = await this.dashboardRepository.findOne(dashboardId);
    if (!dashboard) {
      throw new RpcException({ message: 'Dashboard not found', status: 404 });
    }

    // 2. Verificar que quien invita pertenece al dashboard
    const inviters = await this.rolDashboardRepository.findUsersInDashboard(invitedBy);
    const belongs = inviters.includes(dashboardId);

    if (!belongs) {
      throw new RpcException({
        message: "Inviter doesn't belong to this dashboard",
        status: 403
      });
    }
    const invitedUser = await lastValueFrom(
      this.gatewayClient.send(
        { cmd: 'get_user_by_email' },
        { email: to }
      )
    );
    
    if (!invitedUser) {
      throw new RpcException({
        message: 'User to invite does not exist',
        status: 404
      });
    }
    if (inviters.includes(invitedUser)){
      throw new RpcException({
        message: 'User is already in the dashboard',
        status: 409
      })
    }

    const inviterUsername = await lastValueFrom(
          this.gatewayClient.send(
            { cmd: 'get_user_by_id' },
            { id: invitedBy }
          )
        );
    // 3. Crear/añadir al nuevo usuario al dashboard
    await this.rolDashboardRepository.save({
      idUser: invitedUser,
      dashboardId: dashboard.id,
      participantTypeId: 3
    });

    // 4. Generar link "no sensible"
    const inviteLink = `http://localhost:4200/dashboard/${dashboardId}`;
    // 5. Retornar datos para que el gateway mande el mail

    return {
      ok: true,
      to: data.to,
      invitedBy: inviterUsername,
      dashboardName: dashboard.name,
      inviteLink
    };

  }

}
