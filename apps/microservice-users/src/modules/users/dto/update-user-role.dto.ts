import { IdOnlyRolDto } from '@microservice-users/modules/roles/dto/id-only-role.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class UpdateUserRoles {
  @ApiProperty({
    description: 'Lista de roles a actualizar',
    type: [IdOnlyRolDto],
    example: [{ code: 'User' }, { code: 'Admin' }],
  })
  @ValidateNested({ each: true })
  @Type(() => IdOnlyRolDto)
  roles: IdOnlyRolDto[];
}
