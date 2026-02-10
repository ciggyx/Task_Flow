import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateParticipantTypeDto {
  @ApiProperty({
    description: 'Nombre descriptivo del tipo de participante o rol (ej. Alumno, Tutor).',
    example: 'Profesor',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  name: string;
}
