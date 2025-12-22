import { CreateParticipantTypeDto } from "@microservice-tasks/participant-type/dto/create-participant-type.dto";
import { UpdateParticipantTypeDto } from "@microservice-tasks/participant-type/dto/update-participant-type.dto";
import { ParticipantType } from "@microservice-tasks/participant-type/entities/participant-type.entity";

export interface IParticipantTypeRepository {
  create(createParticipantTypeDto: CreateParticipantTypeDto): Promise<ParticipantType>;

  findAll(): Promise<ParticipantType[]>;

  findOne(id: number): Promise<ParticipantType | null>;

  findOneByName(name: string): Promise<ParticipantType | null>;

  update(
    id: number,
    updatedParticipantTypeDto: UpdateParticipantTypeDto,
  ): Promise<UpdateParticipantTypeDto | null>;

  remove(id: number): Promise<void>;

  save(participantType: ParticipantType): Promise<ParticipantType>;

  count(): Promise<number>;

  saveArray(participantType: { name: string }[]): Promise<ParticipantType[]>;
}
