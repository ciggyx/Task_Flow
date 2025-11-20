import { PartialType } from '@nestjs/swagger';
import { CreateRolDashboardDto } from './create-rol-dashboard.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateRolDashboardDto extends PartialType(CreateRolDashboardDto) {
  @IsOptional()
  @IsNumber()
  idUser: number;
}
