import { forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DashboardService } from '../dashboard/dashboard.service';
import { RolDashboardService } from '../rol-dashboard/rol-dashboard.service';
import { DashboardStatsDto } from './dto/monthly-stats.dto';
import { TaskRepository } from '@microservice-tasks/infra/typeorm/task.repository';
import { ClientProxy } from '@nestjs/microservices';
import { DashboardStatsResponseDto } from './dto/dashboard-stats-response.dto';
import { firstValueFrom } from 'rxjs';
import { UserDataResponseDto } from './dto/user-data.dto';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name);
  constructor(
    @Inject(forwardRef(() => TaskRepository))
    private readonly taskRepository: TaskRepository,
    @Inject(forwardRef(() => DashboardService))
    private dashboardService: DashboardService,
    private readonly rolDashboardService: RolDashboardService,
    @Inject('GATEWAY_CLIENT')
    private readonly gatewayClient: ClientProxy,
    private readonly configService: ConfigService,
  ) {}

  async generateAndNotify(month: number, year: number) {
    const dashboards = await this.dashboardService.findAll();
    for (const dashboard of dashboards) {
      try {
        const dto: DashboardStatsDto = {
          dashboardId: dashboard.id,
          year: year,
          month: month
        };

        const stats: DashboardStatsResponseDto = await this.generateMonthlyStats(dto);

        // Si no hay tareas o el dashboard no existe (null), saltamos
        if (!stats || stats.totalTasks === 0) continue;

        const usersIds : number[] = await this.rolDashboardService.findUsersInDashboard(dashboard.id);

        // Solo enviamos si hay usuarios y hay estadísticas
        if (usersIds.length > 0) {
          const usersData : UserDataResponseDto = await firstValueFrom( this.gatewayClient.send(
          { cmd: 'get_users_by_id'},
          usersIds )
          );
          try {
            await firstValueFrom(
              this.gatewayClient.send(
                { cmd: 'gateway_send_stats' },
                { stats, users: usersData }
              )
            );
          } catch (error) 
          {this.logger.error(`Error enviando el mail: ${error.message}`);
          }
        }
      } catch (error) {
        // Si un dashboard falla (ej. 404), logueamos y seguimos con el siguiente
        this.logger.error(`Error procesando dashboard ${dashboard.id}: ${error.message}`);
        continue; 
      }
    }
  }

  async generateMonthlyStats(dto: DashboardStatsDto) : Promise<DashboardStatsResponseDto | null>{
    // 1. Desestructuración para limpieza
    const { dashboardId, year, month } = dto;

    // 2. Validación de existencia del dashboard
    const dashboard = await this.dashboardService.findOne(dashboardId);
    if (!dashboard) throw new NotFoundException('Dashboard not found');
    // 3. Cálculo de fechas
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // 4. Delegación al repositorio personalizado
    const tasks = await this.taskRepository.findTasksStartingBetweenDatesInDashboard(
      startDate,
      endDate,
      dashboardId
    );

    // 5. Procesamiento de estadísticas
    const total = tasks.length;
    if(total === 0){
      return null
    }
    const completed = tasks.filter(t => t.status.name === 'Realizada').length;
    const pending = tasks.filter(t => t.status.name === 'Pendiente').length;
    const inProgress = tasks.filter(t => t.status.name === 'En progreso').length;

    const completionRate = total === 0 ? '0%' : `${Math.round((completed / total) * 100)}%`;

    const baseUrl = this.configService.get<string>('FRONTEND_URL');

    const dashboardLink = `${baseUrl}/dashboard/${dashboardId}`;

    return {
      dashboardLink,
      dashboardName: dashboard.name,
      year,
      month,
      totalTasks: total,
      completedTasks: completed,
      pendingTasks: pending,
      inProgressTasks: inProgress,
      completionRate,
    };
  }
}
