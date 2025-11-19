import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    description: 'Nombre de usuario',
    example: 'johndoe123',
  })
  @IsString()
  identifierName: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'johndoe123',
  })
  @IsString()
  password: string;
}
