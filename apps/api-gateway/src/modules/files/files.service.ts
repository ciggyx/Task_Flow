import { existsSync } from 'fs';
import { join } from 'path';

import { BadRequestException, HttpException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { normalizeRemoteError } from '../auth/error/normalize-remote-error';

@Injectable()
export class FilesService {
  constructor(
    @Inject('DASHBOARD_SERVICE') private readonly dashboardClient: ClientProxy,
  ) { }

  async getStaticTaskImage(imageName: string) {
    try {
      const imagePath = join(__dirname, '../../../static/tasks', imageName);

      const image: string = await firstValueFrom(
        this.dashboardClient.send({ cmd: 'get_task_image' }, { imagePath }),
      );
      return image;
    } catch (err: unknown) {
      const payload = normalizeRemoteError(err);
      throw new HttpException(
        { error: payload },
        typeof payload.status === 'number' ? payload.status : 500,
      );
    }
  }
}
