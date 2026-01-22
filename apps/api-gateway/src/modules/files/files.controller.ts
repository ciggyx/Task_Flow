import { Response } from 'express';

import { Controller, Delete, Get, HttpCode, Param, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { FilesService } from './files.service';
import { Permissions } from '../authorization/permission.decorator';
import { JwtRs256Guard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../authorization/permission.guard';
import { GetTaskImageDoc } from './docs/get-task-image.doc';
import { DeleteImageDoc } from './docs/delete-image.doc';

@Controller('files')
@ApiBearerAuth('access-token')
@UseGuards(JwtRs256Guard, PermissionsGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) { }

  @Get('task/:imageName')
  @GetTaskImageDoc()
  @Permissions('image.read')
  async findTaskImage(
    @Res() res: Response,
    @Param('imageName') imageName: string
  ) {

    const path = await this.filesService.getStaticTaskImage(imageName);

    res.sendFile(path);
  }

  @Delete('task/:imageName')
  @DeleteImageDoc()
  @Permissions('image.delete')
  @HttpCode(204)
  deleteTaskImage(
    @Param('imageName') imageName: string
  ) {
    return this.filesService.deleteTaskImage(imageName);
  }

}
