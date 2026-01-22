import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

export function DeleteImageDoc() {
    return applyDecorators(
        ApiOperation({
            summary: 'Eliminar una imagen',
        }),

        ApiResponse({
            status: 204,
            description: 'Imagen eliminada correctamente',
        }),

        ApiResponse({
            status: 404,
            description: 'La imagen no existe',
            schema: {
                example: {
                    error: {
                        status: 404,
                        message: "Image with url: ${url} not found",
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