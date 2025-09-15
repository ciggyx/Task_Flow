import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'johndoe@gmail.com',
  })
  @IsString()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'johndoe123',
  })
  @IsString()
  password: string;
}
