import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { DashboardDto } from './interfaces/dashboard.dto';
import { TaskDto } from './interfaces/task.dto';
import { UserDto } from './interfaces/user.dto';

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

    const dashboards: DashboardDto[] = await firstValueFrom(
      this.dashboardClient.send({ cmd: 'get_owned_dashboards' }, { userId }),
    );

    return dashboards;
  }

  async getSharedDashboards(email: string) {
    const userId: number = await firstValueFrom(
      this.usersClient.send({ cmd: 'get_user_by_email' }, { email }),
    );

    const dashboards: DashboardDto[] = await firstValueFrom(
      this.dashboardClient.send({ cmd: 'get_shared_dashboards' }, { userId }),
    );

    return dashboards;
  }

  async getDashboardTasks(id: number): Promise<TaskDto[]> {
    return await firstValueFrom(this.dashboardClient.send({ cmd: 'get_dashboard_tasks' }, { id }));
  }

  async getDashboardUsers(id: number): Promise<UserDto[]> {
    const idUsersInDashboard: number[] = await firstValueFrom(
      this.dashboardClient.send({ cmd: 'get_users_dashboard' }, { id }),
    );

    const usersInDashboard: UserDto[] = await firstValueFrom(
      this.usersClient.send({ cmd: 'get_users_by_id' }, { idUsersInDashboard }),
    );
    return usersInDashboard;
  }
}
