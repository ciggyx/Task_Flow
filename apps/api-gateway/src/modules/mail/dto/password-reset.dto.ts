import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PasswordResetDto {
  @ApiProperty({
    example: 'ponéTuMail@gmal.com',
    description: 'Correo electrónico del usuario que solicita el reseteo',
  })
  @IsEmail()
  to: string;

  @ApiPropertyOptional({
    example: 'usuario123',
    description: 'Nombre de usuario (opcional, solo informativo)',
  })
  @IsString()
  @IsNotEmpty()
  username?: string;

  @ApiProperty({
    example: 'https://www.youtube.com/watch?v=4pbWWmUcKSg',
    description: 'Link para restablecer la contraseña',
  })
  @IsString()
  @IsNotEmpty()
  resetLink: string;
}
