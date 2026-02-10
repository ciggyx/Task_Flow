import { HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDashboardDto } from '@shared/dtos';
import { UpdateDashboardDto } from '@shared/dtos';
import { Dashboard } from './entities/dashboard.entity';
import { AssignTaskDto } from './dto/assign-task.dto';
import { RpcException } from '@nestjs/microservices';
import { CreateRolDashboardDto } from '@microservice-tasks/rol-dashboard/dto/create-rol-dashboard.dto';
import { DASHBOARD_REPO, PARTICIPANT_TYPE_REPO, ROL_DASHBOARD_REPO, TASK_REPO } from '@microservice-tasks/core/ports/tokens';
import { ITaskRepository } from '@microservice-tasks/core/ports/task.interface';
import { IDashboardRepository } from '@microservice-tasks/core/ports/dashboard.interface';
import { IParticipantTypeRepository } from '@microservice-tasks/core/ports/participant-type.interface';
import { IRolDashboardRepository } from '@microservice-tasks/core/ports/rol-dashboard.interface';
import { AuthorizationService } from '@microservice-tasks/authorization/authorization.service';
import { RolDashboardService } from '@microservice-tasks/rol-dashboard/rol-dashboard.service';


@Injectable()
export class DashboardService {
  constructor(
    @Inject(TASK_REPO)
    private readonly taskRepository: ITaskRepository,

    @Inject(DASHBOARD_REPO)
    private readonly dashboardRepository: IDashboardRepository,

    @Inject(PARTICIPANT_TYPE_REPO)
    private readonly participantTypeRepository: IParticipantTypeRepository,

    @Inject(ROL_DASHBOARD_REPO)
    private readonly rolDashboardRepository: IRolDashboardRepository,

    private readonly authorizationService: AuthorizationService,

    private readonly rolDashboardService: RolDashboardService,
  ) { }

  async create(dto: CreateDashboardDto, userId: number): Promise<Dashboard> {
    const dashboardsWithName = await this.rolDashboardService.findOwned(userId)
    const filteredDashboards = dashboardsWithName.filter((d) => d.name === dto.name)

    if (filteredDashboards.length) {
      throw new RpcException({
        message: "Repeated name on dashboard",
        status: HttpStatus.CONFLICT
      });
    }

    const dashboard = await this.dashboardRepository.create({
      name: dto.name,
      description: dto.description,
      requiresReview: dto.requiresReview
    });

    const userRol = await this.participantTypeRepository.findOneByName('Owner');

    const rolDashboardDto = new CreateRolDashboardDto();
    rolDashboardDto.dashboard = dashboard;
    rolDashboardDto.participantType = userRol;
    rolDashboardDto.userId = userId;

    try {
      const rolDashboard = await this.rolDashboardRepository.create(rolDashboardDto);
      await this.rolDashboardRepository.save(rolDashboard);
    } catch (error) {
      console.log(error);
    }

    return dashboard;
  }

  async findAll(): Promise<Dashboard[]> {
    return await this.dashboardRepository.findAll();
  }

  async findOne(id: number): Promise<Dashboard | null> {
    return await this.dashboardRepository.findOne(id);
  }

  async update(updateDashboardDto: UpdateDashboardDto, dashboardId: number, userId:number): Promise<Dashboard | null> {
    await this.authorizationService.canManageDashboard(userId, dashboardId);
    try {
      
      return await this.dashboardRepository.update(updateDashboardDto, dashboardId);
    } catch (error) {
      throw new RpcException({
        error: error.response.error,
        message: error.response.message,
        status: HttpStatus.NOT_FOUND
      });
    }
  }

  async remove(id: number, userId:number): Promise<void> {
    await this.authorizationService.canManageDashboard(userId, id);
    try {
      await this.dashboardRepository.findOne(id);

      await this.dashboardRepository.remove(id);

      return;
    } catch (error) {
      throw new RpcException({
        error: error.response.error,
        message: error.response.message,
        status: HttpStatus.NOT_FOUND
      });
    }
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


  async isRevisable(dashbordId: number) {
    return await this.dashboardRepository.requiresReview(dashbordId)
  }

}
