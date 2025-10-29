import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dashboard } from './entities/dashboard.entity';
import { Status } from 'src/status/entities/status.entity';
import { Priority } from 'src/priority/entities/priority.entity';
import { TaskModule } from 'src/task/task.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dashboard, Status, Priority]),
    TaskModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
