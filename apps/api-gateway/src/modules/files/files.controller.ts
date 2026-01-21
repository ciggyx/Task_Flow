import { Response } from 'express';

import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { FilesService } from './files.service';
import { JwtRs256Guard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../authorization/permission.guard';

@Controller('files')
@ApiBearerAuth('access-token')
@UseGuards(JwtRs256Guard, PermissionsGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) { }

  @Get('task/:imageName')
  async findTaskImage(
    @Res() res: Response,
    @Param('imageName') imageName: string
  ) {

    const path = await this.filesService.getStaticTaskImage(imageName);

    res.sendFile(path);
  }

}
