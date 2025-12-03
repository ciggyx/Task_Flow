import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskModule } from '@microservice-tasks/task/task.module';
import { StatusModule } from '@microservice-tasks/status/status.module';
import { PriorityModule } from '@microservice-tasks/priority/priority.module';
import { DashboardModule } from '@microservice-tasks/dashboard/dashboard.module';
import { ParticipantTypeModule } from '@microservice-tasks/participant-type/participant-type.module';
import { RolDashboardModule } from '@microservice-tasks/rol-dashboard/rol-dashboard.module';

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
    ParticipantTypeModule,
    RolDashboardModule,
  ],
  controllers: [],
  providers: [SeedService],
})
export class SeedModule {}
