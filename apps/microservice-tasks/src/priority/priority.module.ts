import { Module } from '@nestjs/common';
import { PriorityService } from './priority.service';
import { PriorityController } from './priority.controller';
import { InfraModule } from '@microservice-tasks/infra/infra.module';

@Module({
  imports: [InfraModule],
  controllers: [PriorityController],
  providers: [PriorityService],
  exports: [],
})
export class PriorityModule { }
