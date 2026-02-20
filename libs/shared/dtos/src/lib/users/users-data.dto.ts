import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserDataResponseDto {
  @ApiProperty({ 
    example: 'Juan Pérez', 
    description: 'Nombre completo del usuario' 
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    example: 'juan.perez@example.com', 
    description: 'Correo electrónico del usuario' 
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}