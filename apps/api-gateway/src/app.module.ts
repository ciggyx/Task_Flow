import { Module } from '@nestjs/common';
import { AppController } from './modules/app.controller';
import { AppService } from './modules/app.service';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [DashboardModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
