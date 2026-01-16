import { Inject, Injectable, Logger } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { Dashboard } from '@microservice-tasks/dashboard/entities/dashboard.entity';
import { ParticipantType } from '@microservice-tasks/participant-type/entities/participant-type.entity';
import { DASHBOARD_REPO, PARTICIPANT_TYPE_REPO, PRIORITY_REPO, ROL_DASHBOARD_REPO, STATUS_REPO, TASK_REPO } from '@microservice-tasks/core/ports/tokens';
import { IStatusRepository } from '@microservice-tasks/core/ports/status.interface';
import { IPriorityRepository } from '@microservice-tasks/core/ports/priority.interface';
import { ITaskRepository } from '@microservice-tasks/core/ports/task.interface';
import { IDashboardRepository } from '@microservice-tasks/core/ports/dashboard.interface';
import { IParticipantTypeRepository } from '@microservice-tasks/core/ports/participant-type.interface';
import { IRolDashboardRepository } from '@microservice-tasks/core/ports/rol-dashboard.interface';

@Injectable()
export class SeedService {
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
  ) { }

  private readonly logger = new Logger(SeedService.name);

  async seed() {
    await this.seedStatus();
    await this.seedPriority();
    await this.seedDashboard();
    await this.seedParticipantType();
    await this.seedTask();
    await this.seedRolDashboard();
    return this.logger.log('Seed ejecutada');
  }

  private async seedStatus() {
    const count = await this.statusRepository.count();
    if (count === 0) {
      await this.statusRepository.saveArray([
      { name: 'Pending', description: faker.lorem.words(10) },
      { name: 'In Progress', description: faker.lorem.words(10) },
      { name: 'Completed', description: faker.lorem.words(10) },
      { name: 'Undefined', description: faker.lorem.words(10) },
    ]);
      this.logger.log('Estados cargados');
    } else this.logger.log('Los estados ya estaban cargados');
  }

  private async seedPriority() {
    const count = await this.priorityRepository.count();
    if (count === 0) {
      await this.priorityRepository.saveArray([
      { name: 'High', description: faker.lorem.words(7) },
      { name: 'Medium', description: faker.lorem.words(7) },
      { name: 'Low', description: faker.lorem.words(7) },
      { name: 'Undefined', description: faker.lorem.words(7) },
    ]);
      this.logger.log('Prioridades cargadas');
    } else this.logger.log('Las prioridades ya estaban cargadas');
  }

  private async seedDashboard() {
    const count = await this.dashboardRepository.count();
    if (count === 0) {
      const dashboards = Array.from({ length: 10 }).map(() => ({
        name: `${faker.company.catchPhraseAdjective()} ${faker.word.noun()} dashboard`,
        description: faker.lorem.sentence(),
      }));

      await this.dashboardRepository.saveArray(dashboards);
      this.logger.log('Dashboards cargados');
    } else {
      this.logger.log('Los dashboards ya estaban cargados');
    }
  }

  private async seedParticipantType() {
    const count = await this.participantRepository.count();
    if (count == 0) {
      await this.participantRepository.saveArray([
        { name: 'Owner' },
        { name: 'Admin' },
        { name: 'Editor' },
        { name: 'Viewer' },
      ]);
      this.logger.log('Roles en dashboard cargados');
    } else this.logger.log('Los roles en dashboard ya estaban cargados');
  }

  private async seedTask() {
    const count = await this.taskRepository.count();
    if (count === 0) {
      // Traemos dashboards y status para asegurarnos que existan
      const dashboards = await this.dashboardRepository.findAll();
      const statuses = (await this.statusRepository.findAll()).filter(
        (s) => s.name !== 'Undefined',
      );
      const priorities = (await this.priorityRepository.findAll()).filter(
        (p) => p.name !== 'Undefined',
      );

      if (dashboards.length === 0 || statuses.length < 3 || priorities.length < 3) return;

      const tasks = Array.from({ length: 40 }).map(() => ({
        name: `${faker.hacker.ingverb()} ${faker.hacker.noun()}`,
        description: faker.lorem.sentence(),
        startDate: faker.date.between({ from: 30, to: Date.now() }),
        endDate: Math.random() < 0.7 ? faker.date.between({ from: 20, to: Date.now() }) : null,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        dashboard: dashboards[Math.floor(Math.random() * dashboards.length)],
      }));

      await this.taskRepository.saveArray(tasks);

      this.logger.log('Tareas cargadas');
    } else this.logger.log('Las tareas ya estaban cargadas');
  }

  private async seedRolDashboard() {
    const count = await this.rolDashboardRepository.count();
    if (count === 0) {
      const participantTypes = await this.participantRepository.findAll();
      const dashboards = await this.dashboardRepository.findAll();

      if (!participantTypes.length || !dashboards.length) {
        this.logger.warn('No hay datos para crear roles en dashboard');
      }

      const entries = 40;
      const entriesPerDashboard = 4;
      const rolDashboardArray: {
        dashboard: Dashboard;
        participantType: ParticipantType;
        userId: number;
      }[] = [];
      for (let i = 1; i <= entries; i++) {
        const dashboardIndex = Math.floor(i / entriesPerDashboard) % dashboards.length;
        const participantIndex = i % participantTypes.length;

        rolDashboardArray.push({
          dashboard: dashboards[dashboardIndex],
          participantType: participantTypes[participantIndex],
          userId: i,
        });
      }

      await this.rolDashboardRepository.saveArray(rolDashboardArray);
      this.logger.log('Roles en los dashboards cargados');
    } else this.logger.log('Los roles en los dashboards ya estaban cargados');
  }
}
