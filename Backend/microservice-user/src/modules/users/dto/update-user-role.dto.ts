import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { IdOnlyRolDto } from 'src/modules/roles/dto/id-only-role.dto';

export class UpdateUserRole {
  @ApiProperty({
    description: 'Código del rol a updatear',
    example: {
      code: 'User',
    },
  })
  @ValidateNested()
  @Type(() => IdOnlyRolDto)
  rol: IdOnlyRolDto;
}
