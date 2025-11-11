import { Module } from '@nestjs/common';
import { AppController } from './modules/app.controller';
import { AppService } from './modules/app.service';
import { ClientsModule } from '@nestjs/microservices';
import { DASHBOARD_SERVICE, USERS_SERVICE } from './config/miroservice.config';

@Module({
  imports: [ClientsModule.register([USERS_SERVICE, DASHBOARD_SERVICE])],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
