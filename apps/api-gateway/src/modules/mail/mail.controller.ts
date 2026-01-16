import { Controller, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

import { MailGatewayService } from './mail.service';
import { PasswordResetDto } from './dto/password-reset.dto';
import { DashboardInvitationDto } from './dto/dashboard-invitation.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DashboardStatsDto } from './dto/dashboard-stats-response.dto';
import { SendStatsEmailDto } from './dto/send-stats.dto';

@ApiTags('Mail')
@Controller('mail')
  export class MailController {
    constructor(private readonly mailService: MailGatewayService) {}

    @Post('password-reset')
    @ApiOperation({
      summary: 'Enviar correo de reseteo de contraseña',
      description:
        'Envía un email con el enlace para restablecer la contraseña del usuario.',
    })
    @ApiBody({ type: PasswordResetDto })
    @ApiResponse({
      status: 201,
      description: 'Correo de reseteo enviado correctamente',
    })
    @ApiResponse({
      status: 400,
      description: 'Datos inválidos',
    })
    async sendPasswordReset(@Body() body: PasswordResetDto) {
      return this.mailService.sendPasswordReset(body);
    }

    @Post('dashboard-invitation')
    @ApiOperation({
      summary: 'Enviar invitación a un dashboard',
      description:
        'Envía un correo invitando a un usuario a unirse a un dashboard.',
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
    async sendDashboardInvitation(@Body() body: DashboardInvitationDto) {
      return this.mailService.sendDashboardInvitation(body);
    }

    @MessagePattern({ cmd: 'gateway_send_stats' })
    async handleSendStatsEmail(@Payload() data: SendStatsEmailDto) {
    const { stats, users } = data;
      return await this.mailService.sendStatsEmail({
        stats,
        users,
      })
  }
}

