import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min, ValidateNested } from 'class-validator';
import { UserDataResponseDto } from '@shared/dtos';
import { DashboardStatsResponseDto } from '@shared/dtos';


export class SendStatsEmailDto {
  @ApiProperty({ type: UserDataResponseDto })
  @ValidateNested()
  @Type(() => UserDataResponseDto)
  user: UserDataResponseDto;

  @ApiProperty({ type: DashboardStatsResponseDto })
  @ValidateNested()
  @Type(() => DashboardStatsResponseDto)
  stats: DashboardStatsResponseDto;

  @ApiProperty({ description: 'Año de la consulta', example: 2026 })
  @IsInt()
  year: number;

  @ApiProperty({ 
    description: 'Mes de la consulta (1-12)', 
    example: 1,
    minimum: 1,
    maximum: 12 
  })
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

}