import { Module } from '@nestjs/common';
import { NodemailerAdapter } from '../infraestructure/adapters/nodemailer.adapter';
import { SendPasswordResetUseCase } from '../core/use-cases/send-password-reset.usecase';
import { MailController } from './mail.controller';

@Module({
  controllers: [MailController],
  providers: [
    // Caso de uso
    SendPasswordResetUseCase,

    // Adapter (infraestructura)
    // Si en un futuro se quiere cambiar el adaptador se cambia el implement
    {
      provide: 'MailAdapter',
      useClass: NodemailerAdapter,
    },
  ],
})
export class MailModule {}
