import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) { }

  @MessagePattern({ cmd: 'get_task_image' })
  findTaskImage(
    data: { imagePath: string }
  ) {

    const path = this.filesService.getStaticTaskImage(data.imagePath);

    return path;
  }

}
