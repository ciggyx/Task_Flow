import { Module } from '@nestjs/common';
import { AppController } from './modules/app.controller';
import { AppService } from './modules/app.service';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ClientsModule } from '@nestjs/microservices';
import { DASHBOARD_SERVICE, USERS_SERVICE } from './config/microservice.config';

@Module({
  imports: [
    DashboardModule,
    ClientsModule.register([USERS_SERVICE, DASHBOARD_SERVICE]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
