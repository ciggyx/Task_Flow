import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { MailAdapter } from '../../core/domain/mail.interface';

@Injectable()
export class NodemailerAdapter implements MailAdapter {
  private transporter: nodemailer.Transporter;
  
  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('MAIL_HOST');
    

    this.transporter = nodemailer.createTransport({
      host: host,
      port: this.configService.get<number>('MAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendMail(options: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
  }): Promise<void> {
    await this.transporter.sendMail({
      from: this.configService.get<string>('MAIL_FROM'),
      ...options,
    });
  }
}
