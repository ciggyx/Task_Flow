import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsDateString, IsPositive } from 'class-validator';

export class UpdateTaskDto {

  @ApiPropertyOptional({ description: 'Nombre de la tarea', example: 'Actualizar servidor' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Descripción detallada', example: 'Nueva descripción' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'ID del nuevo estado', example: 3 })
  @IsInt()
  @IsOptional()
  @IsPositive()
  statusId?: number;

  @ApiPropertyOptional({ description: 'ID de la prioridad', example: 2 })
  @IsInt()
  @IsOptional()
  @IsPositive()
  priorityId?: number;

  @ApiPropertyOptional({ description: 'Fecha límite esperada', example: '2026-02-01T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional({ description: 'Fecha en la que realmente se terminó' })
  @IsDateString()
  @IsOptional()
  finishDate?: Date;

  @ApiPropertyOptional({ description: 'ID de quien completó la tarea' })
  @IsInt()
  @IsOptional()
  assignedToUserId?: number;

  @ApiPropertyOptional({ description: 'ID de quien completó la tarea' })
  @IsInt()
  @IsOptional()
  reviewedByUserId?: number;
}