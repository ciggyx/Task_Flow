import { forwardRef, Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Priority } from 'src/priority/entities/priority.entity';
import { Task } from './entities/task.entity';
import { Dashboard } from 'src/dashboard/entities/dashboard.entity';
import { TaskRepository } from './infraestructure/task.repository';
import { StatusModule } from 'src/status/status.module';

@Module({
  imports: [
    forwardRef(() => StatusModule),
    TypeOrmModule.forFeature([Task, Priority, Dashboard]),
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
