import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'xXx_JohnDoe_xXx',
  })
  @IsString()
  name: string;

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

  @IsString()
  @IsOptional()
  description: string;
}
