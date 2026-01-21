import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Nombre de la tarea',
    example: 'Configurar entorno de desarrollo',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción breve de la tarea',
    example: 'Instalar dependencias y configurar variables de entorno',
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiPropertyOptional({
    description: 'Fecha de inicio de la tarea (ISO 8601)',
    example: '2025-08-30T18:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate: Date;

  @ApiPropertyOptional({
    description: 'Fecha de finalización de la tarea (ISO 8601)',
    example: '2025-08-30T18:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  endDate: Date;

  @ApiPropertyOptional({
    description: 'ID del estado asignado a la tarea',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  @IsPositive()
  statusId: number;

  @ApiPropertyOptional({
    description: 'ID de la prioridad asignada a la tarea',
    example: 2,
  })
  @IsNumber()
  @IsOptional()
  @IsPositive()
  priorityId: number;

  @ApiPropertyOptional({
    description: 'ID del dashboard al cual asociar la tarea',
    example: 1,
  })
  @IsNotEmpty()
  dashboardId: number;

  @ApiProperty({
    example: 5,
    description: 'ID de la persona que completó la tarea',
    nullable: true,
    required: false
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  completedByUserId?: number | null;

  @ApiPropertyOptional({ example: '2025-08-30T18:00:00.000Z', description: 'Fecha en la que realmente se terminó' })
  @IsDateString()
  @IsOptional()
  finishDate?: Date;
}
