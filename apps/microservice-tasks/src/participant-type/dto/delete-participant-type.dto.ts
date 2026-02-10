import { ApiProperty } from "@nestjs/swagger";

export class DeleteParticipantTypeDto {
  @ApiProperty({ example: 'Participant type removed successfully' })
  message: string;
  @ApiProperty({ example: 1 })
  deletedId: number;
}