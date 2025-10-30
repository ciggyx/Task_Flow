import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dashboard } from './entities/dashboard.entity';
import { TaskModule } from 'src/task/task.module';
import { StatusModule } from 'src/status/status.module';
import { PriorityModule } from 'src/priority/priority.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dashboard]),
    TaskModule,
    StatusModule,
    PriorityModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
