import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RolDashboardService } from './rol-dashboard.service';
import { CreateRolDashboardDto } from './dto/create-rol-dashboard.dto';
import { UpdateRolDashboardDto } from './dto/update-rol-dashboard.dto';
import { ApiTags } from '@nestjs/swagger'; // Importación de Swagger

@ApiTags('RolDashboard') // Etiqueta para agrupar endpoints en Swagger
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
  findOne(@Param('id') id: string) {
    return this.rolDashboardService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRolDashboardDto: UpdateRolDashboardDto) {
    return this.rolDashboardService.update(+id, updateRolDashboardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolDashboardService.remove(+id);
  }
}
