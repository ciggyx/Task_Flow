import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { IdOnlyPermissionDto } from '../../permissions/dto/id-only-permission.dto';

export class CreateRoleDto {
  @IsString()
  @ApiProperty({ description: 'El código representativo del rol' })
  code: string;

  @IsString()
  @ApiProperty({ description: 'El nombre del rol' })
  name: string;

  @IsString()
  @ApiProperty({ description: 'La descripción del rol' })
  description: string;

  @ValidateNested({ each: true })
  @Type(() => IdOnlyPermissionDto)
  @IsArray()
  @ApiProperty({
    description: 'Array de IDs de permisos a asociar al rol',
    type: [IdOnlyPermissionDto],
    example: [{ id: 1 }, { id: 2 }, { id: 3 }],
  })
  permissions: IdOnlyPermissionDto[];
}
