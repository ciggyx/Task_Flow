import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiProduces, ApiResponse } from "@nestjs/swagger";

export function GetTaskImageDoc() {
    return applyDecorators(
        ApiOperation({
            summary: 'Obtener la imagen de una tarea',
        }),

        ApiResponse({
            status: 200,
            description: 'Imagen encontrada correctamente',
            content: {
                'image/*': {},
            }
        }),


        ApiResponse({
            status: 400,
            description: 'No existe una imagen con el nombre ingresado',
            schema: {
                example: {
                    "error": {
                        "status": 400,
                        "message": "No task found with image",
                        "details": null
                    }
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