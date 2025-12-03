import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IdOnlyPermissionDto } from '@microservice-users/modules/permissions/dto/id-only-permission.dto';

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Código representativo del rol',
    example: 'ADMIN',
  })
  code?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Nombre del rol',
    example: 'Administrador',
  })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Descripción del rol',
    example: 'Rol con todos los privilegios del sistema',
  })
  description?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => IdOnlyPermissionDto)
  @IsArray()
  @ApiPropertyOptional({
    description: 'Lista de IDs de permisos a asociar al rol',
    type: [IdOnlyPermissionDto],
    example: [{ id: 1 }, { id: 2 }, { id: 3 }],
  })
  permissions?: IdOnlyPermissionDto[];
}
