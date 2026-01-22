import { ApiProperty } from "@nestjs/swagger";
import { CreateTaskDto } from "@shared/dtos";

export class CreateTaskWithFileDto {
    @ApiProperty({ type: CreateTaskDto })
    body: CreateTaskDto;

    @ApiProperty({ type: 'string', format: 'binary' })
    file: any;
}