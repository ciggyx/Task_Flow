import { existsSync } from 'fs';

import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class FilesService {

  getStaticTaskImage(imagePath: string) {

    if (!existsSync(imagePath))
      throw new RpcException({
        message: `No task found with image`,
        status: HttpStatus.BAD_REQUEST
      });
    return imagePath;
  }

}
