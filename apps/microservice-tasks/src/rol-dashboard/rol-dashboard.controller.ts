import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { RolDashboardService } from './rol-dashboard.service';
import { CreateRolDashboardDto } from './dto/create-rol-dashboard.dto';
import { UpdateRolDashboardDto } from './dto/update-rol-dashboard.dto';
import { DeleteRolDashboardDto } from './dto/delete-rol-dashboard.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DashboardUserRelation } from '@microservice-tasks/core/ports/rol-dashboard.interface';
import { Dashboard } from '@microservice-tasks/dashboard/entities/dashboard.entity';

@ApiTags('RolDashboard')
@Controller('rol-dashboard')
export class RolDashboardController {
  constructor(private readonly rolDashboardService: RolDashboardService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo rol de dashboard' })
  @ApiResponse({ status: 201, description: 'Rol creado.', type: CreateRolDashboardDto })
  create(@Body() createRolDashboardDto: CreateRolDashboardDto) {
    return this.rolDashboardService.create(createRolDashboardDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los roles de dashboard' })
  @ApiResponse({ status: 200, description: 'Lista de roles.', type: [CreateRolDashboardDto] })
  findAll() {
    return this.rolDashboardService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un rol específico por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Rol encontrado.' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolDashboardService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un rol por ID' })
  @ApiResponse({ status: 200, description: 'Rol actualizado.' })
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateRolDashboardDto: UpdateRolDashboardDto
  ) {
    return this.rolDashboardService.update(id, updateRolDashboardDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un rol por ID' })
  @ApiResponse({ status: 200, description: 'Rol eliminado.', type: DeleteRolDashboardDto })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolDashboardService.remove(id);
  }

  // --- Patrones de Mensajería (Microservicios) ---
  // Nota: Estos no aparecen en Swagger, se usan para comunicación interna.

  @MessagePattern({ cmd: 'delete_User' })
  removeUser(@Payload() data: { dashboardId: number, userId: number, deleterId: number }) {
    return this.rolDashboardService.removeUser(data.dashboardId, data.userId, data.deleterId);
  }

  @MessagePattern({ cmd: 'update_user_role' })
  updateUserRole(@Payload() data: { dashboardId: number, userId: number, updaterId: number, newUserRole: number }) {
    return this.rolDashboardService.updateUserRole(data.dashboardId, data.userId, data.updaterId, data.newUserRole);
  }

  @MessagePattern({ cmd: 'get_users_dashboard' })
  findUsersInDashboard(data: { id: number }): Promise<number[]> {
  return this.rolDashboardService.findUsersInDashboard(data.id);
  }

  @MessagePattern({ cmd: 'get_users_dashboard_with_roles' })
  findUsersInDashboardWithRoles(data: { id: number }): Promise<DashboardUserRelation[]> {
  return this.rolDashboardService.findUsersInDashboardWithRoles(data.id);
  }

  @MessagePattern({ cmd: 'get_owned_dashboards' })
  findOwned(data: { userId: number }): Promise<Dashboard[]> {
    return this.rolDashboardService.findOwned(data.userId);
  }
  
  @MessagePattern({ cmd: 'get_shared_dashboards' })
  findShared(data: { userId: number }): Promise<Dashboard[]> {
    return this.rolDashboardService.findShared(data.userId);
  }
}