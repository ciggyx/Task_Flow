import { forwardRef, Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dashboard } from './entities/dashboard.entity';
import { TaskModule } from 'src/task/task.module';
import { StatusModule } from 'src/status/status.module';
import { PriorityModule } from 'src/priority/priority.module';
import { DashboardRepository } from './infraestructure/dashboard.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dashboard]),
    StatusModule,
    PriorityModule,
    forwardRef(() => TaskModule),
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
