import { Controller, Post, Body } from '@nestjs/common';
import { SendPasswordResetUseCase } from '../core/use-cases/send-password-reset.usecase';

@Controller('mail')
export class MailController {
  constructor(
    private readonly sendPasswordResetUseCase: SendPasswordResetUseCase,
  ) {}

  @Post('password-reset')
  async passwordReset(@Body() body: { email: string; token: string }) {
    return this.sendPasswordResetUseCase.execute(body.email, body.token);
  }
}
