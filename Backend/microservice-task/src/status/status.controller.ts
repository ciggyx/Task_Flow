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
import { StatusService } from './status.service';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthMiddleware } from 'src/middleware/auth.middleware';
import { Permissions } from 'src/middleware/decorators/permissions.decorator';

@ApiTags('Statuses')
@Controller('status')
@UseGuards(AuthMiddleware)
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Post()
  @Permissions(['createStatus'])
  create(@Body() createStatusDto: CreateStatusDto) {
    return this.statusService.create(createStatusDto);
  }

  @Get()
  @Permissions(['getStatues'])
  findAll() {
    return this.statusService.findAll();
  }

  @Get(':id')
  @Permissions(['getStatus'])
  findOne(@Param('id') id: string) {
    return this.statusService.findOne(+id);
  }

  @Patch(':id')
  @Permissions(['updateStatus'])
  update(@Param('id') id: string, @Body() updateStatusDto: UpdateStatusDto) {
    return this.statusService.update(+id, updateStatusDto);
  }

  @Delete(':id')
  @Permissions(['deleteStatus'])
  remove(@Param('id') id: string) {
    return this.statusService.remove(+id);
  }
}
