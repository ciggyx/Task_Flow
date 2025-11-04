import { Inject, Injectable } from '@nestjs/common';
import { CreateParticipantTypeDto } from './dto/create-participant-type.dto';
import { UpdateParticipantTypeDto } from './dto/update-participant-type.dto';
import { ParticipantType } from './entities/participant-type.entity';
import { IParticipantTypeRepository } from './infraestructure/participant-type.interface';
import { DeleteParticipantTypeDto } from './dto/delete-participant-type.dto';

@Injectable()
export class ParticipantTypeService {
  constructor(
    @Inject('IParticipantTypeRepository')
    private readonly participantRepository: IParticipantTypeRepository,
  ) {}

  async create(
    createParticipantTypeDto: CreateParticipantTypeDto,
  ): Promise<ParticipantType> {
    return this.participantRepository.create(createParticipantTypeDto);
  }

  findAll(): Promise<ParticipantType[]> {
    return this.participantRepository.findAll();
  }

  findOne(id: number): Promise<ParticipantType | null> {
    return this.participantRepository.findOne(id);
  }

  update(
    id: number,
    updateParticipantTypeDto: UpdateParticipantTypeDto,
  ): Promise<UpdateParticipantTypeDto | null> {
    return this.participantRepository.update(id, updateParticipantTypeDto);
  }

  async remove(id: number): Promise<DeleteParticipantTypeDto> {
    await this.participantRepository.remove(id);
    return { message: 'ParticipantType deleted successfully.', deletedId: id };
  }
}
