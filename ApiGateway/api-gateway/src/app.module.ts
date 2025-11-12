import { Module } from '@nestjs/common';
import { AppController } from './modules/app.controller';
import { AppService } from './modules/app.service';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    DashboardModule,
    ClientsModule.register([USERS_SERVICE, DASHBOARD_SERVICE]),
  ],
  imports: [DashboardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
