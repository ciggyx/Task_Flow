import { IsNumber, IsPositive, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Dashboard } from '@microservice-tasks/dashboard/entities/dashboard.entity';
import { ParticipantType } from '@microservice-tasks/participant-type/entities/participant-type.entity';

export class CreateRolDashboardDto {
  @ApiProperty({
    description: 'Entidad del Dashboard al que se está asignando el usuario.',
    example: 101,
  })
  @IsNumber()
  @IsPositive()
  dashboard: Dashboard;

  @ApiProperty({
    description: 'ID del usuario',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    description: 'ID del tipo de participante (Rol) asignado a este usuario en el Dashboard.',
    example: 3,
  })
  @IsNumber()
  @IsPositive()
  participantType: ParticipantType;
}
