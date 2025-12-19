import { Injectable, Inject, HttpException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { DashboardDto } from './interfaces/dashboard.dto';
import { TaskDto } from './interfaces/task.dto';
import { UserDto } from './interfaces/user.dto';
import { normalizeRemoteError } from '../auth/error/normalize-remote-error';
import { DashboardInvitationDto } from './dto/dashboard-invitation.dto';
import { CreateDashboardDto, UpdateDashboardDto } from '@shared/dtos';

@Injectable()
export class DashboardService {
  constructor(
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
    @Inject('DASHBOARD_SERVICE') private readonly dashboardClient: ClientProxy,
    @Inject('MAIL_SERVICE') private readonly mailClient: ClientProxy,
  ) { }

  async create(createDashboardDto: CreateDashboardDto, userId: number): Promise<DashboardDto> {
    try {
      const dashboard: DashboardDto = await firstValueFrom(
        this.dashboardClient.send({ cmd: 'create_dashboard' }, { createDashboardDto, userId }),
      );
      return dashboard;
    } catch (err: unknown) {
      const payload = normalizeRemoteError(err);
      throw new HttpException(
        { error: payload },
        typeof payload.status === 'number' ? payload.status : 500,
      );
    }
  }

  async update(updateDashboardDto: UpdateDashboardDto, dashboardId: number): Promise<DashboardDto> {
    try {
      const dashboard: DashboardDto = await firstValueFrom(
        this.dashboardClient.send({ cmd: 'update_dashboard' }, { updateDashboardDto, dashboardId }),
      );
      return dashboard;
    } catch (err: unknown) {
      const payload = normalizeRemoteError(err);
      throw new HttpException(
        { error: payload },
        typeof payload.status === 'number' ? payload.status : 500,
      );
    }
  }

  async delete(dashboardId: number): Promise<void> {
    try {
      await firstValueFrom(this.dashboardClient.send({ cmd: 'delete_dashboard' }, { dashboardId }), { defaultValue: null });
      return;
    } catch (err: unknown) {
      const payload = normalizeRemoteError(err);
      throw new HttpException(
        { error: payload },
        typeof payload.status === 'number' ? payload.status : 500,
      );
    }
  }

  async getOwnedDashboards(userId: number) {

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
  async processDashboardInvitation(data: DashboardInvitationDto) {
    try {
      const response: DashboardInvitationDto = await firstValueFrom(
        this.dashboardClient.send({ cmd: 'dashboard_invite' }, data),
      );
      return response;
    } catch (err: unknown) {
      const payload = normalizeRemoteError(err);
      throw new HttpException(
        { success: false, error: payload },
        typeof payload.status === 'number' ? payload.status : 500,
      );
    }
  }
  async sendDashboardInvitationMail(mailData: DashboardInvitationDto) {
    try {
      const response: { status: string } = await firstValueFrom(
        this.mailClient.send({ cmd: 'mail-dashboard-invitation' }, mailData),
      );
      return { success: true, data: response };
    } catch (err: unknown) {
      const payload = normalizeRemoteError(err);
      throw new HttpException(
        { success: false, error: payload },
        payload.status ?? 500,
      );
    }
  }

}
