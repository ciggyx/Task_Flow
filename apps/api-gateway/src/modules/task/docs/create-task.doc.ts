import { applyDecorators } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CreateTaskDto, TaskResponseDto } from "@shared/dtos";

export function CreateTaskDoc() {
    return applyDecorators(
        ApiOperation({
            summary: 'Crear una nueva tarea',
        }),

        ApiBody({ type: CreateTaskDto }),

        ApiResponse({
            status: 201,
            description: 'Tarea correctamente creada',
            type: TaskResponseDto
        }),

        ApiResponse({
            status: 404,
            description: 'No se encontró el dashboard o no se encontró la prioridad o el estado (runnear seed)',
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