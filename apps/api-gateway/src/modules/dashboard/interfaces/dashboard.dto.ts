import { ApiProperty } from '@nestjs/swagger';

export class DashboardDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'AI-driven dashboard' })
  name: string;

  @ApiProperty({ example: 'Descripción del dashboard' })
  description: string;
}
