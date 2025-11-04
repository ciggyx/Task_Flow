import { Module } from '@nestjs/common';
import { ParticipantTypeService } from './participant-type.service';
import { ParticipantTypeController } from './participant-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipantType } from './entities/participant-type.entity';
import { ParticipantTypeRepository } from './infraestructure/participant-type.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ParticipantType])],
  controllers: [ParticipantTypeController],
  providers: [
    ParticipantTypeService,
    {
      provide: 'IParticipantTypeRepository',
      useClass: ParticipantTypeRepository,
    },
  ],
  exports: ['IParticipantTypeRepository'],
})
export class ParticipantTypeModule {}
