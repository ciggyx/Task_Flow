import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Status } from 'src/status/entities/status.entity';
import { Priority } from 'src/priority/entities/priority.entity';
import { Task } from 'src/task/entities/task.entity';
import { Dashboard } from 'src/dashboard/entities/dashboard.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Status)
    private readonly statusRepository: Repository<Status>,

    @InjectRepository(Priority)
    private readonly priorityRepository: Repository<Priority>,

    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(Dashboard)
    private readonly dashboardRepository: Repository<Dashboard>,
  ) {}

  async seed() {
    await this.seedStatus();
    await this.seedPriority();
    await this.seedDashboard();
    await this.seedTask();
    return 'Seed executed';
  }

  private async seedStatus() {
    const count = await this.statusRepository.count();
    if (count === 0) {
      await this.statusRepository.save([
        { name: 'Pendiente' },
        { name: 'En progreso' },
        { name: 'Realizada' },
      ]);
      console.log('Status cargado');
    }
  }

  private async seedPriority() {
    const count = await this.priorityRepository.count();
    if (count === 0) {
      await this.priorityRepository.save([
        { name: 'Alta' },
        { name: 'Media' },
        { name: 'Baja' },
      ]);
      console.log('Priority cargada');
    }
  }

  private async seedDashboard() {
    const count = await this.dashboardRepository.count();
    if (count === 0) {
      await this.dashboardRepository.save([
        { name: 'Dashboard 1', description: 'Principal' },
        { name: 'Dashboard 2', description: 'Secundario' },
      ]);
      console.log('Dashboards cargados');
    }
  }

  private async seedTask() {
    const count = await this.taskRepository.count();
    if (count === 0) {
      // Traemos dashboards y status para asegurarnos que existan
      const dashboards = await this.dashboardRepository.find();
      const statuses = await this.statusRepository.find();
      const priorities = await this.priorityRepository.find();

      if (!dashboards.length || !statuses.length) return;

      await this.taskRepository.save([
        {
          name: 'Configurar entorno',
          description: 'Instalar dependencias y configurar variables',
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: statuses[0],
          priority: priorities[0],
          dashboard: dashboards[0],
        },
        {
          name: 'Diseñar base de datos',
          description: 'Modelar entidades y relaciones',
          startDate: new Date(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          status: statuses[1],
          priority: priorities[1],
          dashboard: dashboards[0],
        },
        {
          name: 'Ejemplo sin endDate',
          description: 'Task sin fecha de finalización',
          startDate: new Date(),
          status: statuses[2],
          priority: priorities[1],
          dashboard: dashboards[1],
        },
      ]);

      console.log('Tasks cargadas');
    }
  }
}
