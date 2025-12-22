import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { InfraModule } from '@microservice-tasks/infra/infra.module';

@Module({
  imports: [InfraModule],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [],
})
export class TaskModule { }
