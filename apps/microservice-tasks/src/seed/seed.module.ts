import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { TaskModule } from 'src/task/task.module';
import { StatusModule } from 'src/status/status.module';
import { PriorityModule } from 'src/priority/priority.module';
import { DashboardModule } from 'src/dashboard/dashboard.module';
import { ParticipantTypeModule } from 'src/participant-type/participant-type.module';
import { RolDashboardModule } from 'src/rol-dashboard/rol-dashboard.module';
import { TypeOrmModule } from '@nestjs/typeorm';

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
