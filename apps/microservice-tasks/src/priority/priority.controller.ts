import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { PriorityService } from './priority.service';
import { CreatePriorityDto } from './dto/create-priority.dto';
import { UpdatePriorityDto } from './dto/update-priority.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { MessagePattern } from '@nestjs/microservices';

@ApiTags('Priorities') // Agrupa los endpoints en la UI de Swagger
@Controller('priority')
export class PriorityController {
  constructor(private readonly priorityService: PriorityService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva prioridad' })
  @ApiResponse({ status: 201, description: 'Prioridad creada con éxito.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  create(@Body() createPriorityDto: CreatePriorityDto) {
    return this.priorityService.create(createPriorityDto);
  }

  @MessagePattern({ cmd: 'get_priority' }) // Microservicios (no aparece en Swagger por defecto)
  getPrioritiesMS() {
    return this.priorityService.findAll();
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las prioridades' })
  findAll() {
    return this.priorityService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una prioridad por ID' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.priorityService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una prioridad' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePriorityDto: UpdatePriorityDto) {
    return this.priorityService.update(id, updatePriorityDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una prioridad' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.priorityService.remove(id);
  }
}