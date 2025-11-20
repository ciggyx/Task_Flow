import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ example: 'admin' })
  name: string;

  @ApiProperty({ example: 'admin@sistema.com' })
  email: string;
}
