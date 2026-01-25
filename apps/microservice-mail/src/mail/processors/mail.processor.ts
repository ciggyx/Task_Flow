    import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject, Logger } from '@nestjs/common';
import { NodemailerAdapter } from '../../infraestructure/adapters/nodemailer.adapter';
import { statsReportTemplate } from '../../templates/send-stats.template';
import { passwordResetTemplate } from '../../templates/password-reset.template';
import { dashboardInvitationTemplate } from '../../templates/dashboard-invitation.template';

@Processor('mail-queue') // Asegúrate que coincida con el nombre en el Service
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(
    @Inject('MAIL_ADAPTER') private readonly mailAdapter: NodemailerAdapter,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    this.logger.log(`Procesando tarea: ${job.name} (ID: ${job.id})`);

    switch (job.name) {
      case 'send-password-reset':
        return this.handlePasswordReset(job.data);

      case 'send-dashboard-invitation':
        return this.handleDashboardInvitation(job.data);

      case 'send-individual-stats':
        return this.handleStatsEmail(job.data);

      default:
        throw new Error(`Manejador no encontrado para el trabajo: ${job.name}`);
    }
  }

  // --- Métodos Privados para mantener limpio el switch ---

  private async handlePasswordReset(data: any) {
  try {
    const html = passwordResetTemplate(data.username, data.resetLink);
    
    const result = await this.mailAdapter.sendMail({
      to: data.to,
      subject: 'Restore Password',
      html,
    });

  } catch (error) {
    // ESTO es lo que necesitamos ver en la consola
    console.error('❌ Error detallado al enviar mail:', error);
    
    // Si el error tiene respuesta de SMTP, imprímela
    if (error.response) {
       console.error('Respuesta del servidor SMTP:', error.response);
    }
  }
}

  private async handleDashboardInvitation(data: any) {
    const html = dashboardInvitationTemplate(data.invitedBy, data.dashboardName, data.inviteLink);
    await this.mailAdapter.sendMail({
      to: data.to,
      subject: 'Dashboard Invitation',
      html,
    });
  }

  private async handleStatsEmail(data: any) {
    const { user, stats } = data;
    const html = statsReportTemplate(user.name, stats);
    await this.mailAdapter.sendMail({
      to: user.email,
      subject: `📊 Reporte de ${stats.dashboardName}`,
      html,
    });
  }
}