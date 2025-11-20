import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateParticipantTypeDto {
  @ApiProperty({
    description: 'Nombre descriptivo del tipo de participante o rol.',
    example: 'Profesor',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
