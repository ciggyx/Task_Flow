import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, Min } from "class-validator";

export class DeleteDashboardDto {
  @IsNumber()
  @Min(1)
  @ApiProperty({
    description: 'ID del dashboard a eliminar',
    example: 1
  })
  id: number;
}
