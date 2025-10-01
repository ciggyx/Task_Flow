import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateParticipantTypeDto } from './dto/create-participant-type.dto';
import { UpdateParticipantTypeDto } from './dto/update-participant-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ParticipantType } from './entities/participant-type.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ParticipantTypeService {
  constructor(
    @InjectRepository(ParticipantType)
    private readonly participantRepository: Repository<ParticipantType>,
  ) {}
  async create(
    createParticipantTypeDto: CreateParticipantTypeDto,
  ): Promise<ParticipantType> {
    const newTypeParticipant = this.participantRepository.create(
      createParticipantTypeDto,
    );
    return await this.participantRepository.save(newTypeParticipant);
  }

  findAll() {
    return this.participantRepository.find();
  }

  findOne(id: number) {
    return this.participantRepository.findOne({ where: { id } });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updateParticipantTypeDto: UpdateParticipantTypeDto) {
    return this.findOne(id);
  }

  async remove(id: number) {
    const typeParticipantExist = await this.participantRepository.findOne({
      where: { id },
    });
    if (!typeParticipantExist) {
      throw new NotFoundException(`Type participant ${id} not found`);
    }
    return await this.participantRepository.delete(id);
  }
}
