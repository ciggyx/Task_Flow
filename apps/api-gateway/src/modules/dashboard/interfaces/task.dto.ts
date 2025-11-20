import { ApiProperty } from '@nestjs/swagger';

export class TaskDto {
  @ApiProperty({ example: 3 })
  id: number;

  @ApiProperty({ example: 'bypassing firewall' })
  name: string;

  @ApiProperty({
    example: 'Amplexus alter veritas accusantium vacuus crepusculum volva delicate vester ultio.',
  })
  description: string;

  @ApiProperty({ example: '1984-10-01T07:58:51.804Z' })
  startDate: Date;

  @ApiProperty({ example: null, nullable: true })
  endDate: Date | null;

  @ApiProperty({ example: null, nullable: true })
  finishDate: Date | null;

  @ApiProperty({ example: 2 })
  statusId: number;

  @ApiProperty({ example: 1 })
  priorityId: number;

  @ApiProperty({ example: 1 })
  dashboardId: number;
}
