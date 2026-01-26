import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { StatusService } from './status.service';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MessagePattern } from '@nestjs/microservices';

@ApiTags('Statuses')
@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo estado' })
  create(@Body() createStatusDto: CreateStatusDto) {
    return this.statusService.create(createStatusDto);
  }

  @MessagePattern({ cmd: 'get_status' })
  getStatusMS() {
    return this.statusService.findAll();
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los estados' })
  findAll() {
    return this.statusService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener estado por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.statusService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar un estado' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateStatusDto: UpdateStatusDto) {
    return this.statusService.update(id, updateStatusDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un estado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.statusService.remove(id);
  }
}