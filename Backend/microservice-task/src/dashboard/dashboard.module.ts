import { forwardRef, Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dashboard } from './entities/dashboard.entity';
import { TaskModule } from 'src/task/task.module';
import { StatusModule } from 'src/status/status.module';
import { PriorityModule } from 'src/priority/priority.module';
import { DashboardRepository } from './infraestructure/dashboard.repository';
import { ParticipantTypeModule } from 'src/participant-type/participant-type.module';
import { RolDashboardModule } from 'src/rol-dashboard/rol-dashboard.module';

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
