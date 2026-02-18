import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDashboardDto {
  @ApiProperty({
    description: 'Nombre del dashboard',
    example: 'Panel de control del equipo de desarrollo',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción del dashboard',
    example: 'Este dashboard contiene las métricas principales del sprint',
  })
  @IsString()
  @IsOptional()
  description?: string;
  @ApiProperty({
    description: 'Indica si el dashboard requiere revisión', 
    example: false,
  })
  @IsBoolean()
  requiresReview: boolean;

  @ApiPropertyOptional({
    description: 'nombre del preset o plantilla del dashboard',
    example: 'preset1',
  })
  @IsString()
  @IsOptional()
  preset?: string;

}
