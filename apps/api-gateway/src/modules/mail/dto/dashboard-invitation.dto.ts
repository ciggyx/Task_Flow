import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DashboardInvitationDto {
  @ApiProperty({
    example: 'ponéTumail@gmail.com',
    description: 'Email del usuario invitado al dashboard',
  })
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre del usuario que envía la invitación',
  })
  @IsString()
  @IsNotEmpty()
  invitedBy: string;

  @ApiProperty({
    example: 'Dashboard de Ventas',
    description: 'Nombre del dashboard al que se invita',
  })
  @IsString()
  @IsNotEmpty()
  dashboardName: string;

  @ApiProperty({
    example: 'https://www.youtube.com/watch?v=4pbWWmUcKSg',
    description: 'Link para aceptar la invitación al dashboard',
  })
  @IsString()
  @IsNotEmpty()
  inviteLink: string;
}
