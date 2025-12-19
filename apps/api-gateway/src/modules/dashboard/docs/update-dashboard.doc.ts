import { applyDecorators } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { DashboardDto } from "../interfaces/dashboard.dto";
import { CreateDashboardDto } from "@shared/dtos";

export function UpdateDashboardDoc() {
    return applyDecorators(
        ApiOperation({
            summary: 'Actualizar un dashboard',
        }),

        ApiBody({ type: CreateDashboardDto }),

        ApiResponse({
            status: 200,
            description: 'Dashboard correctamente creado',
            type: DashboardDto
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