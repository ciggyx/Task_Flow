import { IsNumber, IsPositive, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRolDashboardDto {
  @ApiProperty({
    description: 'ID del Dashboard al que se está asignando el usuario.',
    example: 101,
  })
  @IsNumber()
  @IsPositive()
  idDashboard: number;

  @ApiProperty({
    description: 'ID del usuario',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  idUser: number;

  @ApiProperty({
    description:
      'ID del tipo de participante (Rol) asignado a este usuario en el Dashboard.',
    example: 3,
  })
  @IsNumber()
  @IsPositive()
  idRol: number;
}
