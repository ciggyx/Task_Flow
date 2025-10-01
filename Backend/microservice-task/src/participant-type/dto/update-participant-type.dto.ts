import { PartialType } from '@nestjs/swagger';
import { CreateParticipantTypeDto } from './create-participant-type.dto';

export class UpdateParticipantTypeDto extends PartialType(CreateParticipantTypeDto) {}
