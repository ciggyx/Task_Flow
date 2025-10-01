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
import { ParticipantTypeService } from './participant-type.service';
import { CreateParticipantTypeDto } from './dto/create-participant-type.dto';
import { UpdateParticipantTypeDto } from './dto/update-participant-type.dto';
import { AuthMiddleware } from 'src/middleware/auth.middleware';
import { Permissions } from 'src/middleware/decorators/permissions.decorator';

@Controller('participant-type')
@UseGuards(AuthMiddleware)
export class ParticipantTypeController {
  constructor(
    private readonly participantTypeService: ParticipantTypeService,
  ) {}

  @Post()
  @Permissions(['createParticipantType'])
  create(@Body() createParticipantTypeDto: CreateParticipantTypeDto) {
    return this.participantTypeService.create(createParticipantTypeDto);
  }

  @Get()
  @Permissions(['getParticipantTypes'])
  findAll() {
    return this.participantTypeService.findAll();
  }

  @Get(':id')
  @Permissions(['getParticipantType'])
  findOne(@Param('id') id: string) {
    return this.participantTypeService.findOne(+id);
  }

  @Patch(':id')
  @Permissions(['updateParticipantType'])
  update(
    @Param('id') id: string,
    @Body() updateParticipantTypeDto: UpdateParticipantTypeDto,
  ) {
    return this.participantTypeService.update(+id, updateParticipantTypeDto);
  }

  @Delete(':id')
  @Permissions(['deleteParticipantType'])
  remove(@Param('id') id: string) {
    return this.participantTypeService.remove(+id);
  }
}
