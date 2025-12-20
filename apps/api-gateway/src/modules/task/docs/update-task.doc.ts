import { applyDecorators } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CreateTaskDto, TaskResponseDto } from "@shared/dtos";

export function UpdateTaskDoc() {
    return applyDecorators(
        ApiOperation({
            summary: 'Actualizar una tarea',
        }),

        ApiBody({ type: CreateTaskDto }),

        ApiResponse({
            status: 200,
            description: 'Tarea correctamente actualizada',
            type: TaskResponseDto
        }),

        ApiResponse({
            status: 404,
            description: 'No se encontró la tarea a actualizar',
            schema: {
                example: {
                    error: {
                        status: 404,
                        message: "Dasboard with id: ${id} not found.",
                        details: null,
                    },
                },
            },
        }),

        ApiResponse({
            status: 401,
            description: 'El usuario no está logueado',
            schema: {
                example: {
                    statusCode: 401,
                    error: "Unauthorized",
                    message: "Missing Authorization header",
                },
            },
        }),

    );
}