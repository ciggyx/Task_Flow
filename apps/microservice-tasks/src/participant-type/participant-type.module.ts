import { Module } from '@nestjs/common';
import { ParticipantTypeService } from './participant-type.service';
import { ParticipantTypeController } from './participant-type.controller';
import { InfraModule } from '@microservice-tasks/infra/infra.module';

@Module({
  imports: [InfraModule],
  controllers: [ParticipantTypeController],
  providers: [ParticipantTypeService],
  exports: [],
})
export class ParticipantTypeModule { }
