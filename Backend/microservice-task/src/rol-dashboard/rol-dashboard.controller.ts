import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { RolDashboardService } from './rol-dashboard.service';
import { CreateRolDashboardDto } from './dto/create-rol-dashboard.dto';
import { UpdateRolDashboardDto } from './dto/update-rol-dashboard.dto';
import { AuthMiddleware } from 'src/middleware/auth.middleware';
import { Permissions } from 'src/middleware/decorators/permissions.decorator';

@Controller('rol-dashboard')
@UseGuards(AuthMiddleware)
export class RolDashboardController {
  constructor(private readonly rolDashboardService: RolDashboardService) {}

  @Post()
  @Permissions(['createRolDashboard'])
  create(@Body() createRolDashboardDto: CreateRolDashboardDto) {
    return this.rolDashboardService.create(createRolDashboardDto);
  }

  @Get()
  @Permissions(['getRolDashboards'])
  findAll() {
    return this.rolDashboardService.findAll();
  }

  @Get(':id')
  @Permissions(['getRolDashboard'])
  findOne(@Param('id') id: string) {
    return this.rolDashboardService.findOne(+id);
  }

  @Patch(':id')
  @Permissions(['updateRolDashboard'])
  update(
    @Param('id') id: string,
    @Body() updateRolDashboardDto: UpdateRolDashboardDto,
  ) {
    return this.rolDashboardService.update(+id, updateRolDashboardDto);
  }

  @Delete(':id')
  @Permissions(['deleteRolDashboard'])
  remove(@Param('id') id: string) {
    return this.rolDashboardService.remove(+id);
  }
}
