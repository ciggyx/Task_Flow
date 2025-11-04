import { InjectRepository } from '@nestjs/typeorm';
import { IParticipantTypeRepository } from './participant-type.interface';
import { ParticipantType } from '../entities/participant-type.entity';
import { Repository } from 'typeorm';
import { CreateParticipantTypeDto } from '../dto/create-participant-type.dto';
import { UpdateParticipantTypeDto } from '../dto/update-participant-type.dto';
import { NotFoundException } from '@nestjs/common';

export class ParticipantTypeRepository implements IParticipantTypeRepository {
  constructor(
    @InjectRepository(ParticipantType)
    private readonly participantTypeRepository: Repository<ParticipantType>,
  ) {}
  create(
    createParticipantTypeDto: CreateParticipantTypeDto,
  ): Promise<ParticipantType> {
    const participantType = this.participantTypeRepository.create(
      createParticipantTypeDto,
    );

    return this.participantTypeRepository.save(participantType);
  }

  findAll(): Promise<ParticipantType[]> {
    return this.participantTypeRepository.find();
  }

  findOne(id: number): Promise<ParticipantType | null> {
    return this.participantTypeRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updatedParticipantTypeDto: UpdateParticipantTypeDto,
  ): Promise<UpdateParticipantTypeDto | null> {
    const participantTypeDto = await this.participantTypeRepository.preload({
      id,
      ...updatedParticipantTypeDto,
    });

    if (!participantTypeDto)
      throw new NotFoundException(`Participant-Type with id: ${id} not found`);

    return this.participantTypeRepository.save(participantTypeDto);
  }

  async remove(id: number): Promise<void> {
    await this.participantTypeRepository.delete(id);
    return;
  }

  save(participantType: ParticipantType): Promise<ParticipantType> {
    return this.participantTypeRepository.save(participantType);
  }
}
