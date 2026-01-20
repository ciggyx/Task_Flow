import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtRs256Guard } from "../auth/jwt-auth.guard";
import { PermissionsGuard } from "../authorization/permission.guard";

@ApiTags('Leaderboard') // Agrupa en Swagger bajo esta sección
@Controller('leaderboard')
@ApiBearerAuth('access-token')
@UseGuards(JwtRs256Guard, PermissionsGuard)
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get(':dashboardId')
  @ApiOperation({ summary: 'Obtener el leaderboard completo de un dashboard' })
  @ApiParam({ name: 'dashboardId', description: 'ID del dashboard', example: 1 })
  @ApiResponse({ status: 200, description: 'Retorna todos los registros del ranking para ese dashboard.' })
  async findByDashboard(@Param('dashboardId') dashboardId: number) {
    return this.leaderboardService.findByDashboard(dashboardId);
  }

  @Get('rankings/:dashboardId')
  @ApiOperation({ summary: 'Obtener los mejores N puestos (Top Rankings)' })
  @ApiParam({ name: 'dashboardId', description: 'ID del dashboard', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Cantidad de usuarios a mostrar', example: 5 })
  @ApiResponse({ status: 200, description: 'Retorna el top de usuarios con más puntos.' })
  async getTopRankings(
    @Param('dashboardId') dashboardId: number, 
    @Query('limit') limit?: number,
  ) {
    return this.leaderboardService.getTopRankings(dashboardId, limit ? limit : 5);
  }
}