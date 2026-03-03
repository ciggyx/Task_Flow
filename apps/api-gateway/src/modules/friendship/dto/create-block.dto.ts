import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class CreateBlockDto {

    @ApiProperty({
        description: 'ID del usuario que envía la solicitud',
        example: 1,
    })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    requesterId?: number;


    @ApiProperty({
        description: 'Mail del usuario que recibe la solicitud',
        example: 'tumail@gmail.com',
    })
    @IsEmail({}, { message: 'El formato del email no es válido' })
    @IsNotEmpty()
    email: string;

  
}