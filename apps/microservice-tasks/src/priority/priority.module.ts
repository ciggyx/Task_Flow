import { forwardRef, Module } from '@nestjs/common';
import { PriorityService } from './priority.service';
import { PriorityController } from './priority.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Priority } from './entities/priority.entity';
import { PriorityRepository } from './infraestructure/priority.repository';
import { TaskModule } from '@microservice-tasks/task/task.module';

@Module({
  imports: [TypeOrmModule.forFeature([Priority]), forwardRef(() => TaskModule)],
  controllers: [PriorityController],
  providers: [
    PriorityService,
    {
      provide: 'IPriorityRepository',
      useClass: PriorityRepository,
    },
  ],
  exports: ['IPriorityRepository'],
})
export class PriorityModule {}
