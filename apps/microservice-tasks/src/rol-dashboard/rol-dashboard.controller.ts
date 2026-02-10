import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RolDashboardService } from './rol-dashboard.service';
import { CreateRolDashboardDto } from './dto/create-rol-dashboard.dto';
import { UpdateRolDashboardDto } from './dto/update-rol-dashboard.dto';
import { ApiTags } from '@nestjs/swagger'; // Importación de Swagger
import { MessagePattern } from '@nestjs/microservices';

@ApiTags('RolDashboard') 
@Controller('rol-dashboard')
export class RolDashboardController {
  constructor(private readonly rolDashboardService: RolDashboardService) {}

  @Post()
  create(@Body() createRolDashboardDto: CreateRolDashboardDto) {
    return this.rolDashboardService.create(createRolDashboardDto);
  }

  @Get()
  findAll() {
    return this.rolDashboardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.rolDashboardService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateRolDashboardDto: UpdateRolDashboardDto) {
    return this.rolDashboardService.update(id, updateRolDashboardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.rolDashboardService.remove(id);
  }

  @MessagePattern({cmd : 'delete_User'})
  removeUser(data: { dashboardId: number, userId:number, deleterId: number },) {
  return this.rolDashboardService.removeUser(data.dashboardId, data.userId, data.deleterId);
  }

  @MessagePattern({cmd : 'update_user_role'})
  updateUserRole(data: { dashboardId: number, userId:number, updaterId: number, newUserRole:number},) {
    console.log(data);
  return this.rolDashboardService.updateUserRole(data.dashboardId, data.userId, data.updaterId, data.newUserRole);
  }
}
