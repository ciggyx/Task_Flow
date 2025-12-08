import { Inject, Injectable } from '@nestjs/common';
import { NodemailerAdapter } from '../infraestructure/adapters/nodemailer.adapter';
import { passwordResetTemplate } from '../templates/password-reset.template';
import { PasswordResetDto } from './dto/password-reset.dto';
@Injectable()
export class MailService {
  constructor(
    @Inject('MAIL_ADAPTER') private readonly mailAdapter: NodemailerAdapter,
  ) {}

  async sendPasswordReset(data: PasswordResetDto) {
    const html = passwordResetTemplate(data.username, data.resetLink);

    await this.mailAdapter.sendMail({
      to: data.to,
      subject: 'Restablecer contraseña',
      html,
    });
    return { succes: true, message:'Password reset email sent'}
  }

  async send(dto: { to: string; subject: string; html: string }) {
    return await this.mailAdapter.sendMail({to : dto.to, subject: dto.subject, html:dto.html});
  }
}
