import { ApiProperty } from "@nestjs/swagger";
import { UpdateTaskDto } from "@shared/dtos";

export class UpdateTaskWithFileDto {
    @ApiProperty({ type: UpdateTaskDto })
    body: UpdateTaskDto;

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