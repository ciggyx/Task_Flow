import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { Task } from 'src/task/entities/task.entity';
import { Dashboard } from './entities/dashboard.entity';
import { AssignTaskDto } from './dto/assign-task.dto';
import { CreateTaskDto } from 'src/task/dto/create-task.dto';
import { Priority } from 'src/priority/entities/priority.entity';
import { ITaskRepository } from 'src/task/infraestructure/task.interface';
import { IStatusRepository } from 'src/status/infraestructure/status.interface';
import { IPriorityRepository } from 'src/priority/infraestructure/priority.interface';
import { IDashboardRepository } from './infraestructure/dashboard.interface';
import { DeleteDashboardDto } from './dto/delete-dashboard.dto';
import { IParticipantTypeRepository } from 'src/participant-type/infraestructure/participant-type.interface';
import { IRolDashboardRepository } from 'src/rol-dashboard/infraestructure/rol-dashboard.interface';

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

  async update(
    id: number,
    updateDashboardDto: UpdateDashboardDto,
  ): Promise<Dashboard | null> {
    return await this.dashboardRepository.update(id, updateDashboardDto);
  }

  async remove(id: number): Promise<DeleteDashboardDto> {
    const dashExist = await this.dashboardRepository.findOne(id);
    if (!dashExist)
      throw new NotFoundException(`Dashboard with ${id} not found`);

    await this.dashboardRepository.remove(id);

    return { message: 'Dashboard deleted succesfully', deletedId: id };
  }

  async assignTask(assignTaskDto: AssignTaskDto) {
    const foundDashboard = await this.dashboardRepository.findOne(
      assignTaskDto.dashboardId,
    );
    const foundTask = await this.taskRepository.findOne(assignTaskDto.taskId);
    if (!foundDashboard) {
      throw new NotFoundException(
        `Dashboard with ${assignTaskDto.dashboardId} not found`,
      );
    }
    if (!foundTask) {
      throw new NotFoundException(
        `Task with ${assignTaskDto.taskId} not found`,
      );
    }
    foundTask.dashboardId = assignTaskDto.dashboardId;
    return await this.taskRepository.save(foundTask);
  }

  async createAndAssignTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const { dashboardId, name, description, priorityId, endDate, statusId } =
      createTaskDto;

    const dashboard = await this.dashboardRepository.findOne(dashboardId);
    if (!dashboard) {
      throw new NotFoundException(`Dashboard with id ${dashboardId} not found`);
    }

    const defaultStatusId = 2;
    const resolvedStatusId: number = statusId ?? defaultStatusId;

    const status = await this.statusRepository.findOne(resolvedStatusId);
    if (!status) {
      throw new NotFoundException(
        `Status with id ${resolvedStatusId} not found`,
      );
    }

    if (priorityId) {
      const foundPriority: Priority | null =
        await this.priorityRepository.findOne(priorityId);
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
    const idDashboardsOwned =
      await this.rolDashboardRepository.findOwnedByUserId(userId, userRol);

    return await this.dashboardRepository.findDashboardByRolDashboard(
      idDashboardsOwned,
    );
  }

  async findShared(userId: number): Promise<Dashboard[]> {
    const userRoles = (await this.participantTypeRepository.findAll())
      .filter((p) => p.name !== 'Owner')
      .map((p) => p.id);
    if (!userRoles) {
      throw new NotFoundException(
        `User Roles not found, please run npm run seed`,
      );
    }
    const idDashboardsShared =
      await this.rolDashboardRepository.findSharedByUserId(userId, userRoles);

    return this.dashboardRepository.findDashboardByRolDashboard(
      idDashboardsShared,
    );
  }

  async findUsersInDashboard(id: number): Promise<number[]> {
    const dashboard = await this.dashboardRepository.findOne(id);

    if (!dashboard) {
      throw new NotFoundException(`Dashboard with ID: ${id} not found`);
    }

    return this.rolDashboardRepository.findUsersInDashboard(dashboard);
  }
}
