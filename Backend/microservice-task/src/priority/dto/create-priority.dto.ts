import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePriorityDto {
  @ApiProperty({
    description: 'Nombre de la prioridad',
    example: 'Alta',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  name: string;
}
