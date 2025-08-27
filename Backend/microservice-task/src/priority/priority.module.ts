import { Module } from '@nestjs/common';
import { PriorityService } from './priority.service';
import { PriorityController } from './priority.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Priority } from './entities/priority.entity';
import { Task } from 'src/task/entities/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Priority, Task])],
  controllers: [PriorityController],
  providers: [PriorityService],
})
export class PriorityModule {}
