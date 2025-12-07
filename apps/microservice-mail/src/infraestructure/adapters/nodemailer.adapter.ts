import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { MailAdapter } from '../../core/domain/mail.interface';

@Injectable()
export class NodemailerAdapter implements MailAdapter {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendMail({ to, subject, html, text }: any): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM || '"Sistema" <no-reply@sistema.com>',
      to,
      subject,
      html,
      text,
    });
  }
}
