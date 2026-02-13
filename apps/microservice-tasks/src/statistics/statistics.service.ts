import { Injectable, Logger, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { TaskRepository } from '@microservice-tasks/infra/typeorm/task.repository';
import { DashboardService } from '../dashboard/dashboard.service';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { DashboardInfoDto } from './dto/dashboard-info.dto';
import { CreateNotificationDto } from './dto/notification.dto';
import { LeaderboardService } from '@microservice-tasks/leaderboard/leaderboard.service';
import { Task } from '@microservice-tasks/task/entities/task.entity';
import { DashboardStatsResponseDto } from './dto/dashboard-stats-response.dto';
import { stat } from 'fs';
import { finished } from 'stream';

@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name);

  constructor(
    @Inject(forwardRef(() => TaskRepository))
    private readonly taskRepository: TaskRepository,
    private readonly dashboardService: DashboardService,
    @Inject('GATEWAY_CLIENT')
    private readonly gatewayClient: ClientProxy,
    private readonly configService: ConfigService,
    private readonly leaderboardService: LeaderboardService,
  ) {}


  async generateUserMonthlyReport(month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const users = await firstValueFrom(
      this.gatewayClient.send({ cmd: 'get_all_users' }, {})
    );

    for (const user of users) {
      try {
        const tasks = await this.taskRepository.findTasksStartingBetweenDatesByUser(
          startDate, 
          endDate, 
          user.id 
        );

        if (tasks.length === 0) continue;

        const stats = this.calculateStatsLogic(tasks);

        const mailPayload = { user, stats, month, year };

        const notiPayload: CreateNotificationDto = {
          userId: user.id,
          type: 'MONTHLY_REPORT',
          title: 'Monthly Report Available',
          message: `Your performance report for ${month}/${year} is ready. Completion rate: ${stats.completionRate}.`,
        };

        await Promise.all([
          firstValueFrom(this.gatewayClient.send({ cmd: 'send_user_monthly_stats' }, mailPayload)),
          firstValueFrom(this.gatewayClient.send({ cmd: 'create_notification' }, notiPayload))
        ]).catch(err => this.logger.error(`Error enviando comunicaciones a user ${user.id}: ${err.message}`));

      } catch (error) {
        this.logger.error(`Error procesando reporte para usuario ${user.id}: ${error.message}`);
      }
    }
  }

  /**
   * REPORTE POR DASHBOARD (On Demand para la UI)
   */
  async getDashboardStats(dto: DashboardInfoDto) {
  const dashboard = await this.dashboardService.findOne(dto.dashboardId);
  if (!dashboard) throw new NotFoundException('Dashboard not found');

  const startDate = new Date(dto.year, dto.month - 1, 1);
  const endDate = new Date();

  const tasks = await this.taskRepository.findDashboardActivity(startDate, endDate, dto.dashboardId);
  if (tasks.length === 0) {
    return {
      dashboardName: "Dashboard " + dto.dashboardId,
      dashboardLink: `https://tu-url.com/${dto.dashboardId}`,
      createdThisMonth: 0,
      finishedThisMonth: 0,
      overdue: 0,
      completedOnTime: 0,
      efficiency: "0%",
      priorityBreakdown: { high: 0, medium: 0, low: 0 },
      leaderboard: []
    };
  }

  const stats = this.calculateDashboardStatsLogic(tasks, startDate, endDate);

  // 1. Obtener el ranking (IDs y puntos)
  const rawLeaderboard = await this.leaderboardService.getTopRankings(dashboard.id, dto.dashboardTop);

  // 2. Extraer solo los IDs únicos para la consulta batch
  const userIds = [...new Set(rawLeaderboard.map(entry => entry.userId))];

  let hydratedLeaderboard = rawLeaderboard;

  if (userIds.length > 0) {
    try {
      // 3. Llamada única al microservicio de Auth pasándole el array
      const users: any[] = await firstValueFrom(
        this.gatewayClient.send({ cmd: 'get_users_by_id' }, userIds)
      );

      // 4. Mapear los nombres a los resultados del leaderboard
      hydratedLeaderboard = rawLeaderboard.map(entry => {
        const userData = users.find(u => u.id === entry.userId);
        return {
          ...entry,
          userName: userData?.name || 'Usuario desconocido',
          userEmail: userData?.email || '',
        };
      });
    } catch (error) {
      console.error('Error hydrating leaderboard:', error);
    }
  }
    const baseUrl = 'http://localhost:4200';

    return {
      ...stats,
      leaderboard: hydratedLeaderboard,
      dashboardName: dashboard.name,
      dashboardLink: `${baseUrl}/dashboard/${dto.dashboardId}`,
      month: startDate,
      year: endDate
    };
  }

    private calculateStatsLogic(tasks: Task[]): DashboardStatsResponseDto  {

    const stats = tasks.reduce((acc, task) => {

      const status = task.status?.name;

      if (status === 'Completed') acc.completed++;

      else if (status === 'Pending') acc.pending++;

      else if (status === 'In Progress') acc.inProgress++;

      else if (status === 'In Review') acc.inReview++;

      else if (status === 'Archived') acc.archived++;

      return acc;

    }, { completed: 0, pending: 0, inProgress: 0, inReview: 0, archived: 0 });

    const total = tasks.length;

    const effectiveTotal = total - stats.archived;

    const completionRate = effectiveTotal > 0
      ? `${Math.round(((stats.completed - stats.archived) / effectiveTotal) * 100)}%`
      : '0%';

    return {
      totalTasks: total,
      ...stats,
      completionRate
    };
  }
    private calculateDashboardStatsLogic(tasks: Task[], rangeStart: Date, rangeEnd: Date) {
      const stats = {
        createdInPeriod: 0,
        finishedInPeriod: 0,
        dueInPeriod: 0,
        completedOnTime: 0,
        overdue: 0,
        priorityBreakdown: {
          urgent: {total : 0, finished:0},
          high: { total: 0, finished: 0 },
          medium: { total: 0, finished: 0 },
          low: { total: 0, finished: 0 }
        }
      };

      const today = new Date();

      tasks.forEach(task => {
        const priority = task.priority?.name?.toLowerCase();
        const isFinished = task.status?.name === 'Completed';
        // 1. Tareas creadas desde la fecha de inicio hasta hoy
        if (task.startDate >= rangeStart && task.startDate <= rangeEnd) {
          stats.createdInPeriod++;
        }

        // 2. Tareas terminadas en este periodo
        if (task.finishDate && task.finishDate >= rangeStart && task.finishDate <= rangeEnd) {
          stats.finishedInPeriod++;
        }

        // 3. Compromisos (Due): Tareas que tenían fecha de entrega en este rango
        if (task.endDate && task.endDate >= rangeStart && task.endDate <= rangeEnd) {
          stats.dueInPeriod++;
          
          // ¿Se cumplió el compromiso a tiempo?
          if (task.finishDate && task.finishDate <= task.endDate) {
            stats.completedOnTime++;
          }
        }

        // 4. Overdue (Vencidas): Cualquier tarea cuya fecha de entrega ya pasó y no está completada
        // Esto ahora es dinámico respecto a "Hoy"
        if (task.endDate && task.endDate < today && task.status?.name !== 'Completed') {
          stats.overdue++;
        }

        // 5. Priority Breakdown: Ahora mapeamos la prioridad de todas las tareas encontradas
        if (priority === 'high') {
          stats.priorityBreakdown.high.total++;
          if (isFinished) stats.priorityBreakdown.high.finished++;
        } else if (priority === 'medium') {
          stats.priorityBreakdown.medium.total++;
          if (isFinished) stats.priorityBreakdown.medium.finished++;
        } else if (priority === 'low') {
          stats.priorityBreakdown.low.total++;
          if (isFinished) stats.priorityBreakdown.low.finished++;
        } else if (priority === 'urgent'){
          stats.priorityBreakdown.urgent.total++;
          if (isFinished) stats.priorityBreakdown.urgent.finished++;
        }
      });

      // La eficiencia se calcula sobre los compromisos (Due) del periodo
      const efficiency = stats.dueInPeriod > 0 
        ? Math.round((stats.completedOnTime / stats.dueInPeriod) * 100) 
        : 0;

      return {
        ...stats,
        efficiency: `${efficiency}%`
      };
    }
}