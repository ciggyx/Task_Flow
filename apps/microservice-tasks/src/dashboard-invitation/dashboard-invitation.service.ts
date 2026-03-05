import { Inject, Injectable} from '@nestjs/common';
import { RpcException, ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { 
    DASHBOARD_INVITATION_REPO, 
    DASHBOARD_REPO, 
    ROL_DASHBOARD_REPO, 
    PARTICIPANT_TYPE_REPO 
} from '../core/ports/tokens';
import { InvitationStatus } from '../dashboard-invitation/entities/dashboard-invitation.entity';
import { DashboardInvitationDto } from '@microservice-tasks/dashboard/dto/dashboard-invitation.dto';
import { IDashboardInvitationRepository } from '@microservice-tasks/core/ports/dashboard-invitation.interface';
import { IDashboardRepository } from '@microservice-tasks/core/ports/dashboard.interface';
import { IRolDashboardRepository } from '@microservice-tasks/core/ports/rol-dashboard.interface';
import { IParticipantTypeRepository } from '@microservice-tasks/core/ports/participant-type.interface';
import { AuthorizationService } from '@microservice-tasks/authorization/authorization.service';
import { Dashboard } from '@microservice-tasks/dashboard/entities/dashboard.entity';

@Injectable()
export class DashboardInvitationService {
  constructor(
    @Inject(DASHBOARD_INVITATION_REPO) private readonly invitationRepository: IDashboardInvitationRepository,
    @Inject(DASHBOARD_REPO) private readonly dashboardRepository: IDashboardRepository,
    @Inject(ROL_DASHBOARD_REPO) private readonly rolDashboardRepository: IRolDashboardRepository,
    @Inject(PARTICIPANT_TYPE_REPO) private readonly participantTypeRepository: IParticipantTypeRepository,
    @Inject('GATEWAY_CLIENT') private readonly gatewayClient: ClientProxy, 
    private readonly authorizationService: AuthorizationService,
  ) {}

  async createInvitation(dto: DashboardInvitationDto) {
    const { invitedBy, to, dashboardId } = dto;

    await this.authorizationService.canManageMembers(invitedBy, dashboardId);

    const dashboard : Dashboard = await this.dashboardRepository.findOne(dashboardId);
    if (!dashboard) throw new RpcException({ message: 'Dashboard not found', status: 404 });

    const idInvitedUser : number = await lastValueFrom(
      this.gatewayClient.send({ cmd: 'get_user_by_email' }, { email: to })
    );

    if (!idInvitedUser) throw new RpcException({ message: 'User to invite does not exist', status: 404 });
    const isBlocked : Boolean= await lastValueFrom(
      this.gatewayClient.send({ cmd: 'is_blocked' }, { userId: invitedBy, blockedId: idInvitedUser })
    );

    if (isBlocked) throw new RpcException({ message: 'You can not invite this user', status: 423 });


    const memberIds : number[] = await this.rolDashboardRepository.findUsersInDashboard(dashboard.id);
    if (memberIds.includes(idInvitedUser)) {
       throw new RpcException({ message: 'User is already in the dashboard', status: 409 });
    }

    const pending = await this.invitationRepository.findPendingInvitation(dashboardId, to);
    if (pending) throw new RpcException({ message: 'User already has a pending invitation', status: 409 });

    const inviterData = await lastValueFrom(
        this.gatewayClient.send({ cmd: 'get_user_by_id' }, { id: invitedBy })
    );

    const inviterName = inviterData || 'Un usuario';

    // 6. CREAR INVITACIÓN (PENDIENTE)
    const invitation = this.invitationRepository.create({
        email: to,
        invitedUserId: idInvitedUser,
        invitedByUserId: invitedBy,
        dashboard: dashboard,
        status: InvitationStatus.PENDING,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    
    await this.invitationRepository.save(invitation);


    // 7. EMITIR EVENTO (Aquí ocurre la magia)
    const eventPayload = {
        invitationId: invitation.id,
        targetUserId: idInvitedUser,
        email: to,
        invitedBy: inviterName,
        dashboardName: dashboard.name,
        inviteLink: `${process.env.FRONTEND_URL || 'http://localhost:4200'}/invitation/accept/${invitation.id}`
    };

    this.gatewayClient.emit('dashboard_invitation_created', eventPayload);

    return { success: true, message: 'Invitation sent' };
  }

  async acceptInvitation(invitationId: string, userId: number) {
     const invitation = await this.invitationRepository.findOne(invitationId);

    if (!invitation) {
      throw new RpcException({ message: 'Invitation not found', status: 404 });
    }
     
    if (invitation.status === InvitationStatus.ACCEPTED) {
        return { 
          success: true, 
          dashboardId: invitation.dashboard.id, 
          message: 'Invitation already accepted' 
        };
      }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new RpcException({ message: 'Invitation is no longer valid', status: 400 });
    }
     
     // Seguridad: Solo el invitado puede aceptar
     if (invitation.invitedUserId !== userId) {
         throw new RpcException({ message: 'Unauthorized to accept this invitation', status: 403 });
     }

     // LÓGICA DE NEGOCIO: Agregar al dashboard
     const userRol = await this.participantTypeRepository.findOneByName('Editor');

    if (!userRol) {
      throw new RpcException({ 
          message: 'System Error: Default ParticipantType "Editor" not found in database.', 
          status: 500 
      });
    }

     await this.rolDashboardRepository.updateUserInDashboard({
       userId: userId,
       dashboard: invitation.dashboard,
       participantType: userRol
     });
     
     // Actualizar estado
     invitation.status = InvitationStatus.ACCEPTED;
     await this.invitationRepository.save(invitation);
     
     return { success: true, dashboardId: invitation.dashboard.id };
  }
}