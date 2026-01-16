import { Module } from '@nestjs/common';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AuthModule } from './modules/auth/auth.module';
import { TaskModule } from './modules/task/task.module';
import { MailModule } from './modules/mail/mail.module';

@Module({
  imports: [AuthModule, DashboardModule, TaskModule, MailModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
