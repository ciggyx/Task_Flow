import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class DashboardNotificationDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number; // Mapeado desde 'targetUserId'

  @IsString()
  @IsNotEmpty()
  invitedBy: string;

  @IsString()
  @IsNotEmpty()
  dashboardName: string;

  @IsNumber()
  @IsOptional()
  relatedResourceId?: number; // El ID de la invitación para la DB
}