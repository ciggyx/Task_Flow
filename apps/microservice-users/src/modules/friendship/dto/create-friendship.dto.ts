import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateFriendshipDto {

    @ApiProperty({
        description: 'ID del usuario que envía la solicitud',
        example: 1,
    })
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    requesterId: number;


    @ApiProperty({
        description: 'Mail del usuario que recibe la solicitud',
        example: 'tumail@gmail.com',
    })
    @IsEmail({}, { message: 'El formato del email no es válido' })
    @IsNotEmpty()
    email: string;

  
}