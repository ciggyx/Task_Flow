import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordResetDto {
  @ApiProperty({
    example: 'tumail@gmail.com',
    description: 'Correo electrónico del usuario que solicita el reseteo',
  })
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @ApiProperty({
    example: 'usuario123',
    description: 'Nombre del usuario',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'https://www.youtube.com/watch?v=UYG8LFc8W78',
    description: 'Link para restablecer la contraseña',
  })
  @IsString()
  @IsNotEmpty()
  resetLink: string;
}
