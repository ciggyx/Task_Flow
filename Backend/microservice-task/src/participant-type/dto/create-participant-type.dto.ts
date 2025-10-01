import { IsPositive, IsString } from 'class-validator';

export class CreateParticipantTypeDto {
  @IsString()
  @IsPositive()
  name: string;
}
