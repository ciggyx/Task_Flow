import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Status } from 'src/status/entities/status.entity';
import { Priority } from 'src/priority/entities/priority.entity';
import { Task } from './entities/task.entity';
import { Dashboard } from 'src/dashboard/entities/dashboard.entity';
import { TaskRepository } from './infraestructure/task.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Status, Priority, Dashboard])],
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
