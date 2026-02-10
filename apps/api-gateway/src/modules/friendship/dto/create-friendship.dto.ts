import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateFriendshipDto {
  @ApiProperty({
    description: 'Email del usuario al que quieres enviar la solicitud',
    example: 'amigo@ejemplo.com',
  })
  @IsEmail({}, { message: 'El formato del email no es válido' })
  @IsNotEmpty()
  email: string;
}