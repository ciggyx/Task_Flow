import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { IdOnlyRolDto } from 'src/modules/roles/dto/id-only-role.dto';

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
