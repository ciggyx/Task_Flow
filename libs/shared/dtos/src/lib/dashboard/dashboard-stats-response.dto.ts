import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class DashboardStatsResponseDto {
  @ApiProperty({ example: 25, description: 'Total de tareas asignadas en el mes' })
  @IsNumber()
  @Min(0)
  totalTasks: number;

  @ApiProperty({ example: 15, description: 'Tareas con estado Completed' })
  @IsNumber()
  @Min(0)
  completed: number;

  @ApiProperty({ example: 5, description: 'Tareas con estado Pending' })
  @IsNumber()
  @Min(0)
  pending: number;

  @ApiProperty({ example: 3, description: 'Tareas con estado In Progress' })
  @IsNumber()
  @Min(0)
  inProgress: number;

  @ApiProperty({ example: 2, description: 'Tareas con estado In Review' })
  @IsNumber()
  @Min(0)
  inReview: number;

  @ApiProperty({ example: 0, description: 'Tareas enviadas al archivo' })
  @IsNumber()
  @Min(0)
  archived: number;

  @ApiProperty({ example: '80%', description: 'Porcentaje de éxito (excluyendo archivadas)' })
  @IsString()
  completionRate: string;
}