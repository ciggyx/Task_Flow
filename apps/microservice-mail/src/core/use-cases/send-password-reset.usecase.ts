import { Injectable } from '@nestjs/common';
import { MailAdapter } from '../domain/mail.interface';

@Injectable()
export class SendPasswordResetUseCase {
  constructor(private readonly mailAdapter: MailAdapter) {}

  async execute(email: string, token: string) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.mailAdapter.sendMail({
      to: email,
      subject: 'Recuperación de contraseña',
      html: `
        <h1>Recuperación de contraseña</h1>
        <p>Hacé clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
    });
  }
}
