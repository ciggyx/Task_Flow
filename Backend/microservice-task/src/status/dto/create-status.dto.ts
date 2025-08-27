import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStatusDto {
  @ApiProperty({
    description: 'Nombre del estado',
    example: 'En progreso',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  name: string;
}
