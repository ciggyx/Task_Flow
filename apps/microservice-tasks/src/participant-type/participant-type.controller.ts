import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ParticipantTypeService } from './participant-type.service';
import { CreateParticipantTypeDto } from './dto/create-participant-type.dto';
import { UpdateParticipantTypeDto } from './dto/update-participant-type.dto';
import { DeleteParticipantTypeDto } from './dto/delete-participant-type.dto'; // Importalo si lo separaste
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { MessagePattern } from '@nestjs/microservices';

@ApiTags('ParticipantType')
@Controller('participant-type')
export class ParticipantTypeController {
  constructor(private readonly participantTypeService: ParticipantTypeService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo tipo de participante' })
  @ApiResponse({ status: 201, description: 'Tipo de participante creado con éxito.', type: CreateParticipantTypeDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos enviados.' })
  create(@Body() createParticipantTypeDto: CreateParticipantTypeDto) {
    return this.participantTypeService.create(createParticipantTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los tipos de participantes' })
  @ApiResponse({ status: 200, description: 'Lista de tipos obtenida.', type: [CreateParticipantTypeDto] })
  findAll() {
    return this.participantTypeService.findAll();
  }

  @MessagePattern({ cmd: 'get_participant_types' }) 
  getPartcipantTypeMS() {
    return this.participantTypeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tipo de participante por ID' })
  @ApiParam({ name: 'id', description: 'ID numérico del tipo', example: 1 })
  @ApiResponse({ status: 200, description: 'Tipo encontrado.', type: CreateParticipantTypeDto })
  @ApiResponse({ status: 404, description: 'Tipo no encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.participantTypeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un tipo de participante existente' })
  @ApiResponse({ status: 200, description: 'Tipo actualizado correctamente.' })
  @ApiResponse({ status: 404, description: 'El tipo con el ID provisto no existe.' })
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateParticipantTypeDto: UpdateParticipantTypeDto
  ) {
    return this.participantTypeService.update(id, updateParticipantTypeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un tipo de participante' })
  @ApiResponse({ status: 200, description: 'Tipo eliminado correctamente.', type: DeleteParticipantTypeDto })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.participantTypeService.remove(id);
  }
}