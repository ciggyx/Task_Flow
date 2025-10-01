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
import { PriorityService } from './priority.service';
import { CreatePriorityDto } from './dto/create-priority.dto';
import { UpdatePriorityDto } from './dto/update-priority.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthMiddleware } from 'src/middleware/auth.middleware';
import { Permissions } from 'src/middleware/decorators/permissions.decorator';

@ApiTags('Priorities')
@Controller('priority')
@UseGuards(AuthMiddleware)
export class PriorityController {
  constructor(private readonly priorityService: PriorityService) {}

  @Post()
  @Permissions(['createPriority'])
  create(@Body() createPriorityDto: CreatePriorityDto) {
    return this.priorityService.create(createPriorityDto);
  }

  @Get()
  @Permissions(['getPriorities'])
  findAll() {
    return this.priorityService.findAll();
  }

  @Get(':id')
  @Permissions(['getPriority'])
  findOne(@Param('id') id: string) {
    return this.priorityService.findOne(+id);
  }

  @Patch(':id')
  @Permissions(['updatePriority'])
  update(
    @Param('id') id: string,
    @Body() updatePriorityDto: UpdatePriorityDto,
  ) {
    return this.priorityService.update(+id, updatePriorityDto);
  }

  @Delete(':id')
  @Permissions(['deletePriority'])
  remove(@Param('id') id: string) {
    return this.priorityService.remove(+id);
  }
}
