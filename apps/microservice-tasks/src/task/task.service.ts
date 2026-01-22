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
import { ILeaderboardRepository } from '@microservice-tasks/core/ports/leaderboard.interface';
import { LeaderboardService } from '@microservice-tasks/leaderboard/leaderboard.service';
import { IRankableTask } from '@microservice-tasks/core/ports/rankeable-task.interface';
import { ITaskImageRepository } from '@microservice-tasks/core/ports/task-image.interface';

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

    @Inject(LEADERBOARD_REPO) private readonly leaderboardRepository: ILeaderboardRepository,
    private readonly leaderboardService: LeaderboardService,

    @Inject(TASK_IMAGE_REPO)
    private readonly taskImageRepository: ITaskImageRepository,
  ) { }
  async create(createTaskDto: CreateTaskDto, files?: Array<Express.Multer.File>): Promise<TaskResponseDto> {
    const { name, description, priorityId, endDate, statusId, dashboardId, completedByUserId } = createTaskDto;

    const statusTask = statusId
      ? await this.statusRepository.findOne(statusId)
      : await this.statusRepository.findOneByName('Pending');

    const priority = priorityId
      ? await this.priorityRepository.findOne(priorityId)
      : await this.priorityRepository.findOneByName('Undefined');

    const dashboard = await this.dashboardRepository.findOne(dashboardId);

    if (!statusTask) throw new RpcException({ message: 'Status not found', status: HttpStatus.NOT_FOUND });
    if (!priority) throw new RpcException({ message: 'Priority not found', status: HttpStatus.NOT_FOUND });
    if (!dashboard) throw new RpcException({ message: 'Dashboard not found', status: HttpStatus.NOT_FOUND });

    const isCompleted = statusTask.name === 'Completed';

    if (isCompleted && !completedByUserId) {
      throw new RpcException({
        message: 'CompletedByUserId is required when status is Completed',
        status: HttpStatus.BAD_REQUEST
      });
    }

    // 4. CREACIÓN DE LA TAREA
    const newtask = await this.taskRepository.create({
      name,
      description,
      endDate,
      startDate: new Date(),
      finishDate: isCompleted ? new Date() : null, // Seteamos fecha fin si nace completada
      statusId: statusTask.id,
      priorityId: priority.id,
      dashboardId,
      completedByUserId: isCompleted ? completedByUserId : null,
    });

    // 5. AÑADIR IMAGEN
    if (files) {
      if (!newtask.images) newtask.images = [];
      const imagesWithPromises = files.map(async (file) => await this.taskImageRepository.create(file.path));
      const images = await Promise.all(imagesWithPromises);
      newtask.images = images;
    }

    const savedTask = await this.taskRepository.save(newtask);

    if (isCompleted) {
      await this.leaderboardService.handleTaskCompletion(savedTask)
    }

    return savedTask;
  }

  findAll(): Promise<Task[]> {
    return this.taskRepository.findAll();
  }

  findOne(id: number): Promise<Task | null> {
    return this.taskRepository.findOne(id);
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    try {
      // 1. Obtener estado ACTUAL de la BD (La verdad absoluta)
      // Necesitamos finishDate y status para saber si YA estaba completada
      const existingTask = await this.taskRepository.findOne(id);

      if (!existingTask) throw new RpcException({ status: HttpStatus.NOT_FOUND, message: 'Task not found' });

      // 2. Calcular nuevo estado
      let newStatus = existingTask.status;
      if (updateTaskDto.statusId) {
        newStatus = await this.statusRepository.findOne(updateTaskDto.statusId);
      }
      // 3. DEFINIR BANDERAS DE TRANSICIÓN
      const wasCompleted = existingTask.status.name === 'Completed';
      const isNowCompleted = newStatus.name === 'Completed';

      // CASO A: Se está completando ahora (Antes NO, Ahora SÍ)
      const justCompleted = !wasCompleted && isNowCompleted;

      // CASO B: Se está reabriendo (Antes SÍ, Ahora NO)
      const justReopened = wasCompleted && !isNowCompleted;

      // CASO C: Modificación trivial (Sigue completada, ej: corregir descripción)

      // 4. Validación: Si se completa ahora, exigimos usuario
      if (justCompleted && !updateTaskDto.completedByUserId && !existingTask.completedByUserId) {
        throw new RpcException({ message: 'User required', status: HttpStatus.BAD_REQUEST });
      }

      // 5. Preparar datos para guardar
      let finishDateToSave = existingTask.finishDate;

      if (justCompleted) {
        finishDateToSave = new Date(); // Ponemos fecha hoy
      } else if (justReopened) {
        finishDateToSave = null; // Borramos fecha
      }

      // 6. Guardar en Base de Datos
      const savedTask = await this.taskRepository.save({
        ...existingTask,
        ...updateTaskDto,
        status: newStatus,
        finishDate: finishDateToSave,
      });

      // 7. GESTIÓN DE PUNTOS (Post-Save)

      if (justCompleted) {
        // SUMAR PUNTOS
        const lightTask = await this.taskRepository.findOneForRanking(savedTask.id);
        await this.leaderboardService.handleTaskCompletion(lightTask);

      } else if (justReopened) {

        const taskForReversal: IRankableTask = {
          id: existingTask.id,
          completedByUserId: existingTask.completedByUserId, // Usamos el usuario original
          dashboardId: existingTask.dashboardId,
          priority: { name: (await this.priorityRepository.findOne(existingTask.priorityId)).name }, // O cargar relación antes
          endDate: existingTask.endDate,
          finishDate: existingTask.finishDate // Pasamos la fecha vieja para que el cálculo sea igual
        };

        await this.leaderboardService.handleTaskReversal(taskForReversal);
      }

      return savedTask;

    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal Error'
      });
    }
  }

  async remove(id: number): Promise<void> {
    try {
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
