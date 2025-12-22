import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { IParticipantTypeRepository } from '@microservice-tasks/core/ports/participant-type.interface';
import { ParticipantType } from '@microservice-tasks/participant-type/entities/participant-type.entity';
import { CreateParticipantTypeDto } from '@microservice-tasks/participant-type/dto/create-participant-type.dto';
import { UpdateParticipantTypeDto } from '@microservice-tasks/participant-type/dto/update-participant-type.dto';

export class ParticipantTypeRepository implements IParticipantTypeRepository {
  constructor(
    @InjectRepository(ParticipantType)
    private readonly participantTypeRepository: Repository<ParticipantType>,
  ) { }
  count(): Promise<number> {
    return this.participantTypeRepository.count();
  }

  saveArray(participantType: { name: string }[]): Promise<ParticipantType[]> {
    return this.participantTypeRepository.save(participantType);
  }

  findOneByName(name: string): Promise<ParticipantType | null> {
    return this.participantTypeRepository.findOne({ where: { name: name } });
  }

  create(createParticipantTypeDto: CreateParticipantTypeDto): Promise<ParticipantType> {
    const participantType = this.participantTypeRepository.create(createParticipantTypeDto);

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
