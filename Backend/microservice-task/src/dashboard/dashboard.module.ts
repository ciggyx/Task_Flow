import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dashboard } from './entities/dashboard.entity';
import { Task } from 'src/task/entities/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dashboard, Task])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
