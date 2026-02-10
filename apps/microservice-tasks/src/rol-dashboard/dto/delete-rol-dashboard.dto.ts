import { ApiProperty } from "@nestjs/swagger";

export class DeleteRolDashboardDto {
  @ApiProperty({ example: 'Rol de dashboard eliminado con éxito' })
  message: string;
  @ApiProperty({ example: 5 })
  deletedId: number;
}