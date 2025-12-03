import { forwardRef, Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dashboard } from './entities/dashboard.entity';
import { DashboardRepository } from './infraestructure/dashboard.repository';
import { StatusModule } from '@microservice-tasks/status/status.module';
import { PriorityModule } from '@microservice-tasks/priority/priority.module';
import { ParticipantTypeModule } from '@microservice-tasks/participant-type/participant-type.module';
import { TaskModule } from '@microservice-tasks/task/task.module';
import { RolDashboardModule } from '@microservice-tasks/rol-dashboard/rol-dashboard.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dashboard]),
    StatusModule,
    PriorityModule,
    forwardRef(() => TaskModule),
    forwardRef(() => RolDashboardModule),
    ParticipantTypeModule,
  ],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    {
      provide: 'IDashboardRepository',
      useClass: DashboardRepository,
    },
  ],
  exports: ['IDashboardRepository'],
})
export class DashboardModule {}
