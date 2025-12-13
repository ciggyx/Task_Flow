import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PasswordResetDto } from './dto/password-reset.dto';
import { DashboardInvitationDto } from './dto/dashboard-invitation.dto';

@Injectable()
export class MailGatewayService {
  constructor(
    @Inject('MAIL_SERVICE') private readonly mailClient: ClientProxy,
  ) {}

  async sendPasswordReset(data: PasswordResetDto) {
    return await firstValueFrom(
      this.mailClient.send({ cmd: 'password_reset' }, data),
    );
  }
  async sendDashboardInvitation(data: DashboardInvitationDto){
    return await firstValueFrom(
      this.mailClient.send({ cmd :'dashboard_invitation'}, data),
    );
  }
}
