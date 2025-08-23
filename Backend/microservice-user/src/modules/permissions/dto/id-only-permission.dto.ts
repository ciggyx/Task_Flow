import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IdOnlyPermissionDto {
  @ApiProperty({
    description: 'ID numérico del permiso existente',
    example: 1,
  })
  @IsInt()
  id!: number;
}
