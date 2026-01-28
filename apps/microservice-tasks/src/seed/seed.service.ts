import { Inject, Injectable, Logger } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { DeepPartial } from 'typeorm';

// Entities
import { Dashboard } from '@microservice-tasks/dashboard/entities/dashboard.entity';
import { ParticipantType } from '@microservice-tasks/participant-type/entities/participant-type.entity';
import { Leaderboard } from '@microservice-tasks/leaderboard/entities/leaderboard.entity';

// Tokens
import { 
  DASHBOARD_REPO, 
  LEADERBOARD_REPO, 
  PARTICIPANT_TYPE_REPO, 
  PRIORITY_REPO, 
  ROL_DASHBOARD_REPO, 
  STATUS_REPO, 
  TASK_REPO 
} from '@microservice-tasks/core/ports/tokens';

// Interfaces
import { IStatusRepository } from '@microservice-tasks/core/ports/status.interface';
import { IPriorityRepository } from '@microservice-tasks/core/ports/priority.interface';
import { ITaskRepository } from '@microservice-tasks/core/ports/task.interface';
import { IDashboardRepository } from '@microservice-tasks/core/ports/dashboard.interface';
import { IParticipantTypeRepository } from '@microservice-tasks/core/ports/participant-type.interface';
import { IRolDashboardRepository } from '@microservice-tasks/core/ports/rol-dashboard.interface';
import { ILeaderboardRepository } from '@microservice-tasks/core/ports/leaderboard.interface';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @Inject(STATUS_REPO)
    private readonly statusRepository: IStatusRepository,

    @Inject(PRIORITY_REPO)
    private readonly priorityRepository: IPriorityRepository,

    @Inject(TASK_REPO)
    private readonly taskRepository: ITaskRepository,

    @Inject(DASHBOARD_REPO)
    private readonly dashboardRepository: IDashboardRepository,

    @Inject(PARTICIPANT_TYPE_REPO)
    private readonly participantRepository: IParticipantTypeRepository,

    @Inject(ROL_DASHBOARD_REPO)
    private readonly rolDashboardRepository: IRolDashboardRepository,

    @Inject(LEADERBOARD_REPO)
    private readonly leaderboardRepository: ILeaderboardRepository,
  ) { }

  async seed() {
    this.logger.log('Iniciando proceso de Seed...');
    
    // 1. Catálogos básicos
    await this.seedStatus();
    await this.seedPriority();
    await this.seedParticipantType();
    
    // 2. Estructura base (Dashboards)
    await this.seedDashboard();

    // 3. Relación Usuario-Dashboard (NECESARIO ANTES DE TAREAS)
    await this.seedRolDashboard();

    // 4. Tareas (Depende de Dashboards, Status, Priorities y Roles)
    await this.seedTask();

    // 5. Ranking inicial (Depende de Roles)
    await this.seedLeaderboard();

    return this.logger.log('Seed ejecutada con éxito.');
  }

  // --- SEEDERS ---

  private async seedStatus() {
    const count = await this.statusRepository.count();
    if (count === 0) {
      await this.statusRepository.saveArray([
        { name: 'Pending', description: 'Tarea pendiente de inicio' },
        { name: 'In Progress', description: 'Tarea en curso' },
        { name: 'In Review', description: 'Tarea finalizada pero no aprobada' },
        { name: 'Completed', description: 'Tarea finalizada exitosamente' },
        { name: 'Archived', description: 'Tarea archivada' },
      ]);
      this.logger.log('Estados cargados');
    } else this.logger.log('Los estados ya estaban cargados');
  }

  private async seedPriority() {
    const count = await this.priorityRepository.count();
    if (count === 0) {
      await this.priorityRepository.saveArray([
        { name: 'Urgent', description: 'Maxima prioridad' },
        { name: 'High', description: 'Alta prioridad' },
        { name: 'Medium', description: 'Prioridad media' },
        { name: 'Low', description: 'Baja prioridad' },
      ]);
      this.logger.log('Prioridades cargadas');
    } else this.logger.log('Las prioridades ya estaban cargadas');
  }

  private async seedParticipantType() {
    const count = await this.participantRepository.count();
    if (count === 0) {
      await this.participantRepository.saveArray([
        { name: 'Owner' },
        { name: 'Admin' },
        { name: 'Editor' },
        { name: 'Viewer' },
      ]);
      this.logger.log('Tipos de participante cargados');
    } else this.logger.log('Tipos de participante ya estaban cargados');
  }

  private async seedDashboard() {
    const count = await this.dashboardRepository.count();
    if (count === 0) {
      const dashboards = Array.from({ length: 10 }).map(() => ({
        name: `${faker.company.catchPhraseAdjective()} ${faker.word.noun()} Dashboard`,
        description: faker.lorem.sentence(),
        requiresReview: faker.datatype.boolean(),
      }));

      await this.dashboardRepository.saveArray(dashboards);
      this.logger.log('Dashboards cargados');
    } else {
      this.logger.log('Los dashboards ya estaban cargados');
    }
  }

  private async seedRolDashboard() {
    const count = await this.rolDashboardRepository.count();
    if (count === 0) {
      const participantTypes = await this.participantRepository.findAll();
      const dashboards = await this.dashboardRepository.findAll();

      if (!participantTypes.length || !dashboards.length) {
        this.logger.warn('Faltan datos previos (Tipos o Dashboards) para crear roles');
        return;
      }

      const entries = 50; // Total de asignaciones usuario-dashboard
      const rolDashboardArray: {
        dashboard: Dashboard;
        participantType: ParticipantType;
        userId: number;
      }[] = [];

      // Simulamos usuarios con ID del 1 al 20
      for (let i = 0; i < entries; i++) {
        const dashboard = dashboards[Math.floor(Math.random() * dashboards.length)];
        const pType = participantTypes[Math.floor(Math.random() * participantTypes.length)];
        // ID de usuario simulado (1 a 20)
        const fakeUserId = Math.floor(Math.random() * 20) + 1; 

        // Evitar duplicados simples (misma persona, mismo dashboard) en el array
        const exists = rolDashboardArray.find(r => r.dashboard.id === dashboard.id && r.userId === fakeUserId);
        if (!exists) {
          rolDashboardArray.push({
            dashboard: dashboard,
            participantType: pType,
            userId: fakeUserId,
          });
        }
      }

      await this.rolDashboardRepository.saveArray(rolDashboardArray);
      this.logger.log('Roles en los dashboards cargados');
    } else this.logger.log('Los roles en los dashboards ya estaban cargados');
  }

  private async seedTask() {
    const count = await this.taskRepository.count();
    if (count === 0) {
      const dashboards = await this.dashboardRepository.findAll();
      const statuses = await this.statusRepository.findAll();
      const priorities = await this.priorityRepository.findAll();
      const roles = await this.rolDashboardRepository.findAll();

      if (dashboards.length === 0 || statuses.length < 3 || roles.length === 0) return;

      const tasks = Array.from({ length: 100 }).map(() => {
        const dashboard = dashboards[Math.floor(Math.random() * dashboards.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        
        const isCompleted = status.name === 'Completed';
        
        // 1. Filtramos los usuarios que REALMENTE pertenecen a este dashboard
        const validUsersForDashboard = roles
          .filter(r => r.dashboard.id === dashboard.id)
          .map(r => r.userId);

        // 2. Elegimos un usuario al azar de los válidos, o null si no hay nadie
        let assignedUser: number | null = null;
        if (validUsersForDashboard.length > 0) {
           assignedUser = validUsersForDashboard[Math.floor(Math.random() * validUsersForDashboard.length)];
        }

        // Si es Completed pero no hay usuarios en el dashboard, forzamos a Pending para evitar error
        const finalStatus = (isCompleted && !assignedUser) ? statuses.find(s => s.name === 'Pending') : status;
        const finalIsCompleted = finalStatus.name === 'Completed';

        return {
          name: `${faker.hacker.verb()} ${faker.hacker.noun()}`,
          description: faker.lorem.sentence(),
          startDate: faker.date.past(),
          endDate: Math.random() < 0.8 ? faker.date.future() : null, // 80% tienen fecha límite
          finishDate: finalIsCompleted ? new Date() : null,
          status: finalStatus,
          priority: priority,
          dashboard: dashboard,
          assignedToUserId: finalIsCompleted ? assignedUser : null,
        };
      });

      await this.taskRepository.saveArray(tasks);
      this.logger.log('Tareas cargadas (con usuarios asignados si están completadas)');
    } else this.logger.log('Las tareas ya estaban cargadas');
  }

  private async seedLeaderboard() {
    const count = await this.leaderboardRepository.count();
    
    if (count === 0) {
      const roles = await this.rolDashboardRepository.findAll();
      
      // Creamos una entrada de leaderboard inicial para cada usuario asignado a un dashboard
      const leaderboardEntries: DeepPartial<Leaderboard>[] = roles.map((rol) => ({
        userId: rol.userId,
        dashboard: rol.dashboard,
        // Simulamos puntos aleatorios para probar el ranking
        totalPoints: faker.number.int({ min: 0, max: 500 }),
        tasksCompleted: faker.number.int({ min: 0, max: 10 }),
        lastActivity: new Date(),
      }));
  
      await this.leaderboardRepository.saveArray(leaderboardEntries);
      this.logger.log('Datos simulados del leaderboard cargados');
    } else {
      this.logger.log('El leaderboard ya tenía datos');
    }
  }
}