import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Dashboard } from './interfaces/dashboard.inteface';
import { Task } from './interfaces/task.interface';

@Injectable()
export class DashboardService {
  constructor(
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
    @Inject('DASHBOARD_SERVICE') private readonly dashboardClient: ClientProxy,
  ) {}

  async getOwnedDashboards(email: string) {
    const userId: number = await firstValueFrom(
      this.usersClient.send({ cmd: 'get_user_by_email' }, { email }),
    );

    const dashboards: Dashboard[] = await firstValueFrom(
      this.dashboardClient.send({ cmd: 'get_owned_dashboards' }, { userId }),
    );

    return dashboards;
  }

  async getSharedDashboards(email: string) {
    const userId: number = await firstValueFrom(
      this.usersClient.send({ cmd: 'get_user_by_email' }, { email }),
    );

    const dashboards: Dashboard[] = await firstValueFrom(
      this.dashboardClient.send({ cmd: 'get_shared_dashboards' }, { userId }),
    );

    return dashboards;
  }

  async getDashboardTasks(id: number): Promise<Task[]> {
    return await firstValueFrom(
      this.dashboardClient.send({ cmd: 'get_dashboard_tasks' }, { id }),
    );
  }
}
