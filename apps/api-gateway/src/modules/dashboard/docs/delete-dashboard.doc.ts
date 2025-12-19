import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

export function DeleteDashboardDoc() {
    return applyDecorators(
        ApiOperation({
            summary: 'Eliminar un dashboard',
        }),

        ApiResponse({
            status: 204,
            description: 'Dashboard correctamente eliminado',
        }),

        ApiResponse({
            status: 404,
            description: 'El dashboard no existe',
            schema: {
                example: {
                    error: {
                        statusCode: 404,
                        message: "Dashboard with id: ${id} not found",
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