import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ParticipantTypeService } from './participant-type.service';
import { CreateParticipantTypeDto } from './dto/create-participant-type.dto';
import { UpdateParticipantTypeDto } from './dto/update-participant-type.dto';

@Controller('participant-type')
export class ParticipantTypeController {
  constructor(private readonly participantTypeService: ParticipantTypeService) {}

  @Post()
  create(@Body() createParticipantTypeDto: CreateParticipantTypeDto) {
    return this.participantTypeService.create(createParticipantTypeDto);
  }

  @Get()
  findAll() {
    return this.participantTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.participantTypeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateParticipantTypeDto: UpdateParticipantTypeDto) {
    return this.participantTypeService.update(+id, updateParticipantTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.participantTypeService.remove(+id);
  }
}
