import { forwardRef, Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { TaskRepository } from './infraestructure/task.repository';
import { StatusModule } from 'src/status/status.module';
import { PriorityModule } from 'src/priority/priority.module';
import { DashboardModule } from 'src/dashboard/dashboard.module';

@Module({
  imports: [
    forwardRef(() => StatusModule),
    forwardRef(() => PriorityModule),
    forwardRef(() => DashboardModule),
    TypeOrmModule.forFeature([Task]),
  ],
  controllers: [TaskController],
  providers: [
    TaskService,
    {
      provide: 'ITaskRepository',
      useClass: TaskRepository,
    },
  ],
  exports: ['ITaskRepository'],
})
export class TaskModule {}
