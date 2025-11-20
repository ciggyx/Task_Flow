import { Inject, Injectable, Logger } from '@nestjs/common';
import { IStatusRepository } from 'src/status/infraestructure/status.interface';
import { IPriorityRepository } from 'src/priority/infraestructure/priority.interface';
import { ITaskRepository } from 'src/task/infraestructure/task.interface';
import { IDashboardRepository } from 'src/dashboard/infraestructure/dashboard.interface';
import { IParticipantTypeRepository } from 'src/participant-type/infraestructure/participant-type.interface';
import { faker } from '@faker-js/faker';
import { IRolDashboardRepository } from 'src/rol-dashboard/infraestructure/rol-dashboard.interface';
import { Dashboard } from 'src/dashboard/entities/dashboard.entity';
import { ParticipantType } from 'src/participant-type/entities/participant-type.entity';

@Injectable()
export class SeedService {
  constructor(
    @Inject('IStatusRepository')
    private readonly statusRepository: IStatusRepository,

    @Inject('IPriorityRepository')
    private readonly priorityRepository: IPriorityRepository,

    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,

    @Inject('IDashboardRepository')
    private readonly dashboardRepository: IDashboardRepository,

    @Inject('IParticipantTypeRepository')
    private readonly participantRepository: IParticipantTypeRepository,

    @Inject('IRolDashboardRepository')
    private readonly rolDashboardRepository: IRolDashboardRepository,
  ) {}

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
        { name: 'Pendiente', description: faker.lorem.words(10) },
        { name: 'En progreso', description: faker.lorem.words(10) },
        { name: 'Realizada', description: faker.lorem.words(10) },
        { name: 'Undefined', description: faker.lorem.words(10) },
      ]);
      this.logger.log('Estados cargados');
    } else this.logger.log('Los estados ya estaban cargados');
  }

  private async seedPriority() {
    const count = await this.priorityRepository.count();
    if (count === 0) {
      await this.priorityRepository.saveArray([
        { name: 'Alta', description: faker.lorem.words(7) },
        { name: 'Media', description: faker.lorem.words(7) },
        { name: 'Baja', description: faker.lorem.words(7) },
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
        dashboardId: Dashboard;
        participantTypeId: ParticipantType;
        idUser: number;
      }[] = [];
      for (let i = 1; i <= entries; i++) {
        const dashboardIndex = Math.floor(i / entriesPerDashboard) % dashboards.length;
        const participantIndex = i % participantTypes.length;

        rolDashboardArray.push({
          dashboardId: dashboards[dashboardIndex],
          participantTypeId: participantTypes[participantIndex],
          idUser: i,
        });
      }

      await this.rolDashboardRepository.saveArray(rolDashboardArray);
      this.logger.log('Roles en los dashboards cargados');
    } else this.logger.log('Los roles en los dashboards ya estaban cargados');
  }
}
