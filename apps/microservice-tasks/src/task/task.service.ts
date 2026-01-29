import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateTaskDto } from '@shared/dtos';
import { UpdateTaskDto } from '@shared/dtos';
import { Task } from './entities/task.entity';
import { TaskResponseDto } from '@shared/dtos';
import { RpcException } from '@nestjs/microservices';
import { DASHBOARD_REPO, LEADERBOARD_REPO, PRIORITY_REPO, STATUS_REPO, TASK_IMAGE_REPO, TASK_REPO } from '@microservice-tasks/core/ports/tokens';
import { ITaskRepository } from '@microservice-tasks/core/ports/task.interface';
import { IPriorityRepository } from '@microservice-tasks/core/ports/priority.interface';
import { IStatusRepository } from '@microservice-tasks/core/ports/status.interface';
import { IDashboardRepository } from '@microservice-tasks/core/ports/dashboard.interface';
import { LeaderboardService } from '@microservice-tasks/leaderboard/leaderboard.service';
import { ITaskImageRepository } from '@microservice-tasks/core/ports/task-image.interface';
import { AuthorizationService } from '@microservice-tasks/authorization/authorization.service';

@Injectable()
export class TaskService {
  constructor(
    @Inject(TASK_REPO)
    private readonly taskRepository: ITaskRepository,

    @Inject(PRIORITY_REPO)
    private readonly priorityRepository: IPriorityRepository,

    @Inject(STATUS_REPO)
    private readonly statusRepository: IStatusRepository,

    @Inject(DASHBOARD_REPO)
    private readonly dashboardRepository: IDashboardRepository,

    @Inject(LEADERBOARD_REPO) 
    private readonly leaderboardService: LeaderboardService,

    @Inject(TASK_IMAGE_REPO)
    private readonly taskImageRepository: ITaskImageRepository,

    private readonly authorizationService: AuthorizationService,
  ) { }
  async create(createTaskDto: CreateTaskDto, files?: Array<Express.Multer.File>): Promise<TaskResponseDto> {
  const { name, description, priorityId, endDate, statusId, dashboardId, assignedToUserId, createdBy, reviewedByUserId } = createTaskDto;

  await this.authorizationService.canCreateOrDeleteTask(createdBy, dashboardId);

  const statusTask = statusId
    ? await this.statusRepository.findOne(statusId)
    : await this.statusRepository.findOneByName('Pending');

  const priority = priorityId
    ? await this.priorityRepository.findOne(priorityId)
    : await this.priorityRepository.findOneByName('Undefined');

  const dashboard = await this.dashboardRepository.findOne(dashboardId);

  if (!statusTask || !priority || !dashboard) {
    throw new RpcException({ message: 'Data not found', status: HttpStatus.NOT_FOUND });
  }

  const isCompleted = statusTask.name === 'Completed';
  const isInReview = statusTask.name === 'In Review';

  // --- ASIGNACIÓN AUTOMÁTICA AL CREAR ---
  
  // Si nace completada o en revisión y no mandaron usuario, el creador es el responsable
  const finalAssignedTo = assignedToUserId ?? ((isCompleted || isInReview) ? createdBy : null);
  
  // Si nace completada (pasa de "nada" a "completado"), el creador es el supervisor también
  const finalReviewedBy = reviewedByUserId ?? (isCompleted ? createdBy : null);

  const newtask = await this.taskRepository.create({
    name,
    description,
    endDate,
    startDate: new Date(),
    finishDate: isCompleted ? new Date() : (isInReview ? new Date() : null),
    statusId: statusTask.id,
    priorityId: priority.id,
    dashboardId,
    assignedToUserId: finalAssignedTo,
    reviewedByUserId: finalReviewedBy,
    createdBy: createdBy,
  });

  // Gestión de imágenes...
  if (files) {
    const images = await Promise.all(files.map(file => this.taskImageRepository.create(file.path)));
    newtask.images = images;
  }

  const savedTask = await this.taskRepository.save(newtask);

  if (isCompleted) {
    await this.leaderboardService.handleTaskCompletion(savedTask);
  }

  return savedTask;
}

  findAll(): Promise<Task[]> {
    return this.taskRepository.findAll();
  }

  findOne(id: number): Promise<Task | null> {
    return this.taskRepository.findOne(id);
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, userId: number) {
  try {
    const existingTask = await this.taskRepository.findOne(id);
    if (!existingTask) throw new RpcException({ status: HttpStatus.NOT_FOUND, message: 'Task not found' });

    const dashboard = await this.dashboardRepository.findOne(existingTask.dashboardId);

    // 1. Autorización
    await this.authorizationService.canUpdateTask(userId, dashboard, updateTaskDto.statusId);

    // 2. Calcular nuevo estado
    let newStatus = existingTask.status;
    if (updateTaskDto.statusId) {
      newStatus = await this.statusRepository.findOne(updateTaskDto.statusId);
    }

    // 3. DEFINIR BANDERAS
    const wasInReview = existingTask.status.name === 'In Review';
    const wasCompleted = existingTask.status.name === 'Completed';
    const isNowCompleted = newStatus.name === 'Completed';
    const isNowInReview = newStatus.name === 'In Review';

    const justCompleted = !wasCompleted && isNowCompleted;
    const justPutForReview = !wasCompleted && isNowInReview;
    const justReviewed = wasInReview && isNowCompleted;
    const justReopened = wasCompleted && !isNowCompleted && !justPutForReview;

    // --- LÓGICA DE ASIGNACIÓN AUTOMÁTICA ---
    
    // Si pasa a In Review o Completed y no hay nadie asignado, se asigna el que hace la acción
    let assignedToUserIdToSave = updateTaskDto.assignedToUserId ?? existingTask.assignedToUserId;
    if ((isNowInReview || isNowCompleted) && !assignedToUserIdToSave) {
      assignedToUserIdToSave = userId;
    }

    // Si la tarea estaba en revisión y alguien la completa (justReviewed),
    // esa persona es automáticamente el supervisor (reviewedByUserId) si no se envió uno.
    let reviewedByUserIdToSave = updateTaskDto.reviewedByUserId ?? existingTask.reviewedByUserId;
    if (justReviewed && !reviewedByUserIdToSave) {
      reviewedByUserIdToSave = userId;
    }

    // 4. Preparar fecha de fin
    let finishDateToSave = existingTask.finishDate;
    if (justCompleted || justPutForReview) {
      finishDateToSave = new Date();
    } else if (justReopened) {
      finishDateToSave = null;
    }

    // 5. Guardar
    const savedTask = await this.taskRepository.save({
      ...existingTask,
      ...updateTaskDto,
      status: newStatus,
      finishDate: finishDateToSave,
      assignedToUserId: assignedToUserIdToSave,
      reviewedByUserId: reviewedByUserIdToSave,
    });

    // 6. Gestión de puntos (igual que antes)
    if (justCompleted) {
      const lightTask = await this.taskRepository.findOneForRanking(savedTask.id);
      await this.leaderboardService.handleTaskCompletion(lightTask);
    } else if (justReopened) {
       await this.leaderboardService.handleTaskReversal({
          ...existingTask,
          priority: { name: (await this.priorityRepository.findOne(existingTask.priorityId)).name }
       } as any);
    }

    return savedTask;

  } catch (error) {
    throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        error: error.response.error,
        message: error.response.message
      })
  }
}

  async remove(id: number, userId: number): Promise<void> {
    try {
      const task = await this.taskRepository.findOne(id);
      await this.authorizationService.canCreateOrDeleteTask(userId, task.dashboardId);
      return await this.taskRepository.remove(id);
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        error: error.response.error,
        message: error.response.message
      })
    }
  }

  async findTasksWithDashboardId(dashboardId: number): Promise<Task[]> {
    return this.taskRepository.findAllWithDashboardId(dashboardId);
  }
}
