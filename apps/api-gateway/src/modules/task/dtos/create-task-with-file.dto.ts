import { ApiProperty } from "@nestjs/swagger";
import { CreateTaskDto } from "@shared/dtos";

export class CreateTaskWithFileDto {
    @ApiProperty({ type: CreateTaskDto })
    body: CreateTaskDto;

    @ApiProperty({
        description: 'Lista de imágenes a subir',
        type: 'array',
        items: {
            type: 'string',
            format: 'binary',
        },
    })
    files: any[];
}