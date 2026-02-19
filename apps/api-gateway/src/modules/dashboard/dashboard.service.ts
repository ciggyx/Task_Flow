import { Injectable, Inject, HttpException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { DashboardDto } from './interfaces/dashboard.dto';
import { TaskResponseDto } from '@shared/dtos';
import { UserDto } from './interfaces/user.dto';
import { normalizeRemoteError } from '../auth/error/normalize-remote-error';
import { DashboardInvitationDto } from './dto/dashboard-invitation.dto';
import { CreateDashboardDto, UpdateDashboardDto } from '@shared/dtos';
import { DashboardNotificationDto } from './dto/dashboard-notification.dto';
import { DashboardMailDto } from './dto/dashboard-mail.dto';
import { DashboardInfoDto } from './dto/dashboard-info.dto';
import { DashboardStatsQueryDto } from './dto/dashboard-query.dto';

@Injectable()
export class DashboardService {
  constructor(
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
    @Inject('DASHBOARD_SERVICE') private readonly dashboardClient: ClientProxy,
    @Inject('MAIL_SERVICE') private readonly mailClient: ClientProxy,
    @Inject('NOTIFICATIONS_SERVICE') private readonly notificationClient: ClientProxy,
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

  async update(updateDashboardDto: UpdateDashboardDto, dashboardId: number, userId:number): Promise<DashboardDto> {
    try {
      const dashboard: DashboardDto = await firstValueFrom(
        this.dashboardClient.send({ cmd: 'update_dashboard' }, { updateDashboardDto, dashboardId, userId }),
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

  async delete(dashboardId: number, userId:number): Promise<{ success: boolean }> {
    try {
      await firstValueFrom(this.dashboardClient.send({ cmd: 'delete_dashboard' }, { dashboardId, userId }), { defaultValue: null });
      return { success: true }
    } catch (err: unknown) {
      const payload = normalizeRemoteError(err);
      throw new HttpException(
        { error: payload },
        typeof payload.status === 'number' ? payload.status : 500,
      );
    }
  }
    async deleteUser(dashboardId: number, userId:number, deleterId: number): Promise<{ success: boolean }> {
    try {
      await firstValueFrom(this.dashboardClient.send({ cmd: 'delete_User' }, { dashboardId, userId, deleterId }));
      return { success: true };
    } catch (err: unknown) {
      const payload = normalizeRemoteError(err);
      throw new HttpException(
        { error: payload },
        typeof payload.status === 'number' ? payload.status : 500,
      );
    }
  }

    async updateUserRole(dashboardId: number, userId:number, updaterId: number, newUserRole:number): Promise<{ success: boolean }> {
    try {
      await firstValueFrom(this.dashboardClient.send({ cmd: 'update_user_role' }, { dashboardId, userId, updaterId, newUserRole }));
      return { success: true };
    } catch (err: unknown) {
      const payload = normalizeRemoteError(err);
      throw new HttpException(
        { error: payload },
        typeof payload.status === 'number' ? payload.status : 500,
      );
    }
  }

  async getDashboard(dashboardId:number){
    const dashboardName:string= await firstValueFrom(this.dashboardClient.send({cmd:'get_dashboard'}, {dashboardId}));
    return dashboardName;
  }

  async getOwnedDashboards(userId: number) {
    const dashboards: DashboardDto[] = await firstValueFrom(
      this.dashboardClient.send({ cmd: 'get_owned_dashboards' }, { userId }),
    );  
    return dashboards;
  }

  async getSharedDashboards(userId: number) {
    const dashboards: DashboardDto[] = await firstValueFrom(
      this.dashboardClient.send({ cmd: 'get_shared_dashboards' }, { userId }),
    );

    return dashboards;
  }

  async getDashboardTasks(id: number): Promise<TaskResponseDto[]> {
    return await firstValueFrom(this.dashboardClient.send({ cmd: 'get_dashboard_tasks' }, { id }));
  }

  async getDashboardUsers(id: number): Promise<any[]> {
  // 1. Recibimos el array de objetos [{ userId, role }, ...]
  const dashboardData: any[] = await firstValueFrom(
    this.dashboardClient.send({ cmd: 'get_users_dashboard_with_roles' }, { id }),
  );

  if (!dashboardData || dashboardData.length === 0) return [];

  // 2. Extraemos SOLO los ids para consultar al microservicio de Usuarios
  const userIds = dashboardData.map(item => item.userId);

  // 3. Obtenemos la información básica de esos usuarios
  const usersBasicInfo: UserDto[] = await firstValueFrom(
    this.usersClient.send({ cmd: 'get_users_by_id' }, userIds),
  );

  // 4. Cruzamos la info: a cada usuario le pegamos su rol correspondiente
  return usersBasicInfo.map(user => {
    const dashboardRelation = dashboardData.find(d => d.userId === user.id);
    
    return {
      ...user,
      role: dashboardRelation?.role || null
    };
  });
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

  async acceptInvitation(invitationId: string, userId: number){
    try {
      const response: { success: boolean; message: string } = await firstValueFrom(
        this.dashboardClient.send({ cmd: 'accept_dashboard_invitation' }, { invitationId, userId }),
      );
      return response;
    }catch (err: unknown) {
      const payload = normalizeRemoteError(err);
      throw new HttpException(
        { success: false, error: payload },
        payload.status ?? 500,
      );
    }
  }

  async notifyInvitation(rawData: any){
  const mailPayload: DashboardMailDto = {
    to: rawData.email,
    invitedBy: rawData.invitedBy,
    dashboardName: rawData.dashboardName,
    inviteLink: rawData.inviteLink,
  };
  const notificationPayload: DashboardNotificationDto = {
    userId: rawData.targetUserId,
    invitedBy: rawData.invitedBy,
    dashboardName: rawData.dashboardName,
    relatedResourceId: rawData.relatedResourceId || rawData.invitationId,
  };

  this.mailClient.emit({ cmd: 'dashboard_invitation_created' }, mailPayload);
  this.notificationClient.emit({ cmd: 'dashboard_invitation_created' }, notificationPayload);
  }

  async sendDashboardInvitationNotification(notiData: DashboardNotificationDto) {
    try {
      this.notificationClient.emit({cmd : 'dashboard_invitation_created'}, {notiData});
      return { success: true };
    } catch (err: unknown) {
      const payload = normalizeRemoteError(err);
      throw new HttpException(
        { success: false, error: payload },
        payload.status ?? 500,
      );
    }
  }

  async sendDashboardInvitationMail(mailData: DashboardNotificationDto) {
    try {
      this.mailClient.emit({cmd : 'dashboard_invitation_created'}, {mailData});
      return { success: true };
    } catch (err: unknown) {
      const payload = normalizeRemoteError(err);
      throw new HttpException(
        { success: false, error: payload },
        payload.status ?? 500,
      );
    }
  }
  async getDashboardStats(payload : DashboardStatsQueryDto){
    try {
      const stats = await this.dashboardClient.send({cmd : 'get_dashboard_stats'}, payload)
      return stats
    }catch (err: unknown) {
      const payload = normalizeRemoteError(err);
      throw new HttpException(
        { success: false, error: payload },
        payload.status ?? 500,
      );
    }
  }
  async isRevisable(dashboardId: number): Promise<boolean> {
  try {
    const isRevisable: boolean = await firstValueFrom(
      this.dashboardClient.send({ cmd: 'is_revisable' }, { dashboardId })
    );
    return isRevisable;
  } catch (err: unknown) {
    const payload = normalizeRemoteError(err);
    throw new HttpException(
      { success: false, error: payload },
      payload.status ?? 500,
    );
  }
}
}
