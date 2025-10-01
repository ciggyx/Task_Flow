import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskModule } from './task/task.module';
import { StatusModule } from './status/status.module';
import { PriorityModule } from './priority/priority.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedModule } from './seed/seed.module';
import { RolDashboardModule } from './rol-dashboard/rol-dashboard.module';
import { ParticipantTypeModule } from './participant-type/participant-type.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5431,
      username: 'postgres',
      password: 'taskDatabase',
      database: 'task',
      autoLoadEntities: true,
      synchronize: true,
    }),
    TaskModule,
    StatusModule,
    PriorityModule,
    DashboardModule,
    SeedModule,
    RolDashboardModule,
    ParticipantTypeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
