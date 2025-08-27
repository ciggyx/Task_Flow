import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @IsString()
  @ApiProperty({
    description: 'Nombre del permiso',
    example: 'verTareas',
  })
  name: string;

  @IsString()
  @ApiProperty({
    description: 'Descripción del permiso',
    example: 'Permiso que permite al usuario ver todas sus tareas',
  })
  description: string;
}
