import { CreateParticipantTypeDto } from '../dto/create-participant-type.dto';
import { UpdateParticipantTypeDto } from '../dto/update-participant-type.dto';
import { ParticipantType } from '../entities/participant-type.entity';

export interface IParticipantTypeRepository {
  create(
    createParticipantTypeDto: CreateParticipantTypeDto,
  ): Promise<ParticipantType>;

  findAll(): Promise<ParticipantType[]>;

  findOne(id: number): Promise<ParticipantType | null>;

  findOneByName(name: string): Promise<ParticipantType | null>;

  update(
    id: number,
    updatedParticipantTypeDto: UpdateParticipantTypeDto,
  ): Promise<UpdateParticipantTypeDto | null>;

  remove(id: number): Promise<void>;

  save(participantType: ParticipantType): Promise<ParticipantType>;
}
