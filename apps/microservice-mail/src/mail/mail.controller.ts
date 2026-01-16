import { Controller, Post, Body } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

import { MailService } from './mail.service';
import { PasswordResetDto } from './dto/password-reset.dto';
import { DashboardInvitationDto } from './dto/dashboard-invitation.dto';
import { SendStatsEmailDto } from './dto/send-stats.dto';

@ApiTags('Mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send-password-reset')
  @ApiOperation({
    summary: 'Enviar email de recuperación de contraseña',
    description:
      'Envía un correo electrónico con el enlace para restablecer la contraseña del usuario.',
  })
  @ApiBody({ type: PasswordResetDto })
  @ApiResponse({
    status: 201,
    description: 'Correo de recuperación enviado correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  async passwordResetHttp(@Body() data: PasswordResetDto) {
    return this.mailService.sendPasswordReset(data);
  }

  @MessagePattern({ cmd: 'mail-password-reset' })
  async passwordResetMicro(data: PasswordResetDto) {
    return this.mailService.sendPasswordReset(data);
  }

  @Post('send-dashboard-invitation')
  @ApiOperation({
    summary: 'Enviar invitación a dashboard',
    description:
      'Envía un correo electrónico invitando a un usuario a unirse a un dashboard.',
  })
  @ApiBody({ type: DashboardInvitationDto })
  @ApiResponse({
    status: 201,
    description: 'Invitación enviada correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  async dashboardInviteHttp(@Body() data: DashboardInvitationDto) {
    return this.mailService.sendDashboardInvitation(data);
  }

  @MessagePattern({ cmd: 'mail-dashboard-invitation' })
  async dashoboardInviteMicro(data: DashboardInvitationDto) {
    return this.mailService.sendDashboardInvitation(data);
  }

  @MessagePattern({ cmd: 'send_stats_email'})
  async handleSendStastEmail(data: SendStatsEmailDto){
    return await this.mailService.sendStatsEmail(data);
  }
}
