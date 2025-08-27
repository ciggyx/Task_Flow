import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Status } from 'src/status/entities/status.entity';
import { Priority } from 'src/priority/entities/priority.entity';
import { Task } from './entities/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Status, Priority])],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
