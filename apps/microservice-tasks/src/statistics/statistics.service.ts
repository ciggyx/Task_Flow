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
import { DashboardStatsQueryDto } from './dto/dashboard-query.dto';

@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name);

  constructor(
    @Inject(forwardRef(() => TaskRepository))
    private readonly taskRepository: TaskRepository,
    private readonly dashboardService: DashboardService,
    @Inject('GATEWAY_CLIENT')
    private readonly gatewayClient: ClientProxy,
    private readonly leaderboardService: LeaderboardService,
  ) {}


  

  /**
   * REPORTE POR DASHBOARD (On Demand para la UI)
   */
async getDashboardStats(dto: DashboardStatsQueryDto) {
    const dashboard = await this.dashboardService.findOne(dto.dashboardId);
    if (!dashboard) throw new NotFoundException('Dashboard not found');

    // Convertimos strings a fechas reales y ajustamos horas
    const start = new Date(dto.startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(dto.endDate);
    end.setHours(23, 59, 59, 999);

    // Reutilizamos tu método de repositorio existente, ya busca por rangos correctamente
    const tasks = await this.taskRepository.findDashboardActivity(start, end, dto.dashboardId);

    // Si no hay tareas, devolvemos estado vacío
    if (tasks.length === 0) {
      const emptyStats = { total: 0, finished: 0 };
      return {
        dashboardName: dashboard.name,
        dashboardLink: `http://localhost:4200/dashboard/${dto.dashboardId}`,
        createdInPeriod: 0,
        finishedInPeriod: 0,
        overdue: 0,
        completedOnTime: 0,
        efficiency: "0%",
        priorityBreakdown: { 
          urgent: { ...emptyStats }, high: { ...emptyStats }, medium: { ...emptyStats }, low: { ...emptyStats }
        },
        leaderboard: [],
        startDate: start,
        endDate: end
      };
    }

    // Calculamos estadísticas
    const stats = this.calculateRangeStats(tasks, start, end);

    // --- Lógica del Leaderboard (Mantenida igual) ---
    const rawLeaderboard = await this.leaderboardService.getTopRankings(dashboard.id, dto.dashboardTop || 5);
    const userIds = [...new Set(rawLeaderboard.map(entry => entry.userId))];
    let hydratedLeaderboard = rawLeaderboard;

    if (userIds.length > 0) {
      try {
        const users: any[] = await firstValueFrom(
          this.gatewayClient.send({ cmd: 'get_users_by_id' }, userIds)
        );
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
      startDate: start,
      endDate: end
    };
  }

  private calculateRangeStats(tasks: Task[], rangeStart: Date, rangeEnd: Date) {
    type PriorityKey = 'urgent' | 'high' | 'medium' | 'low';
    const stats = {
      createdInPeriod: 0,
      finishedInPeriod: 0,
      completedOnTime: 0,
      overdue: 0, // Tareas con fecha de entrega en el rango que no se cumplieron a tiempo
      dueInPeriod: 0, // Total de tareas que vencían en este rango
      priorityBreakdown: {
        urgent: { total: 0, finished: 0 },
        high: { total: 0, finished: 0 },
        medium: { total: 0, finished: 0 },
        low: { total: 0, finished: 0 }
      }
    };

    tasks.forEach(task => {
      const priority = task.priority?.name?.toLowerCase() as PriorityKey;
      const isFinished = task.status?.name === 'Completed';
      
      // Fechas de la tarea
      const created = new Date(task.startDate);
      const finished = task.finishDate ? new Date(task.finishDate) : null;
      const due = task.endDate ? new Date(task.endDate) : null;

      // 1. Creadas en el rango
      if (created >= rangeStart && created <= rangeEnd) {
        stats.createdInPeriod++;
      }

      // 2. Terminadas en el rango (Para Priority Breakdown y conteo general)
      if (finished && finished >= rangeStart && finished <= rangeEnd) {
        stats.finishedInPeriod++;

        // Priority Breakdown (SOLO de tareas finalizadas en el rango)
        if (priority && stats.priorityBreakdown[priority]) {
           stats.priorityBreakdown[priority].finished++;
           // Nota: Total aquí sería "total finalizadas de esa prioridad", 
           // si quieres "total existentes" debes mover esto fuera del if(finished)
           stats.priorityBreakdown[priority].total++; 
        }
      }

      // 3. Cálculo de Eficiencia (Basado en tareas que VENCÍAN en este periodo)
      if (due && due >= rangeStart && due <= rangeEnd) {
        stats.dueInPeriod++;

        if (finished && finished <= due) {
          // Se terminó antes o en la fecha de entrega
          stats.completedOnTime++;
        } else {
          // Se terminó tarde O aun no se termina
          stats.overdue++;
        }
      }
    });

    // Eficiencia: (A tiempo / Total que vencían) * 100
    const efficiencyVal = stats.dueInPeriod > 0 
      ? Math.round((stats.completedOnTime / stats.dueInPeriod) * 100) 
      : 0;

    return {
      ...stats,
      efficiency: `${efficiencyVal}%`
    };
  }
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