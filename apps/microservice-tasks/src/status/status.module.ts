import { Module } from '@nestjs/common';
import { StatusService } from './status.service';
import { StatusController } from './status.controller';
import { InfraModule } from '@microservice-tasks/infra/infra.module';

@Module({
  imports: [InfraModule],
  controllers: [StatusController],
  providers: [StatusService],
  exports: [],
})
export class StatusModule { }
