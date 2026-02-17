import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";
import { Type } from "class-transformer";

export class DashboardStatsQueryDto {
  @ApiProperty({ example: 25, description: 'ID del dashboard' })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  dashboardId: number;

  @ApiProperty({ example: '2024-01-01', description: 'Fecha de inicio (YYYY-MM-DD)' })
  @IsString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2024-01-31', description: 'Fecha de fin (YYYY-MM-DD)' })
  @IsString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ example: 5, description: 'Cantidad de personas a mostrar en el leaderboard', required: false })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  dashboardTop?: number;
}