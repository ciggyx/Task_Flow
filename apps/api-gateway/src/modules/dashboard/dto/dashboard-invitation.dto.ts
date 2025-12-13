import { IsEmail, IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DashboardInvitationDto {
  @ApiProperty({
    example: 'invitee@mail.com',
    description: 'Email del usuario invitado',
  })
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @ApiProperty({
    example: 12,
    description: 'ID del usuario que envía la invitación',
  })
  @IsInt()
  @IsNotEmpty()
  invitedBy: number;

  @ApiProperty({
    example: 5,
    description: 'ID del dashboard al que se invita',
  })
  @IsInt()
  @IsNotEmpty()
  dashboardId: number;
}
