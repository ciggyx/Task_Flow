import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignTaskDto {
  @ApiProperty({
    description: 'ID del dashboard al que se le asignará la tarea',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  dashboardId: number;

  @ApiProperty({
    description: 'ID de la tarea que se asignará al dashboard',
    example: 12,
  })
  @IsNumber()
  @IsPositive()
  taskId: number;
}
