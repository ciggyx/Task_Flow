import { IsNumber, IsPositive } from 'class-validator';

export class CreateRolDashboardDto {
  @IsNumber()
  @IsPositive()
  idDashboard: number;

  @IsNumber()
  @IsPositive()
  idUser: number;

  @IsNumber()
  @IsPositive()
  idRol: number;
}
