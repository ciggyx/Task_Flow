import { applyDecorators } from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { DashboardDto } from "../interfaces/dashboard.dto";
import { CreateDashboardDto } from "@shared/dtos";

export function CreateDashboardDoc() {
    return applyDecorators(
        ApiOperation({
            summary: 'Crear un nuevo dashboard',
        }),

        ApiBody({ type: CreateDashboardDto }),

        ApiResponse({
            status: 201,
            description: 'Dashboard correctamente creado',
            type: DashboardDto
        }),

        ApiResponse({
            status: 409,
            description: 'El usuario ya tiene tiene un dashboard creado con ese nombre',
            schema: {
                example: {
                    error: {
                        statusCode: 409,
                        message: "Repeated name on dashboard",
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