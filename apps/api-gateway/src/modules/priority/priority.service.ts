import { HttpException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices/client/client-proxy';
import { firstValueFrom } from 'rxjs';
import { normalizeRemoteError } from '../auth/error/normalize-remote-error';


@Injectable()
export class PriorityService {
    constructor(
        @Inject('DASHBOARD_SERVICE') private readonly dashboardClient: ClientProxy,
    ) { }

  async findAll() {
    try{
      const priority = await firstValueFrom(this.dashboardClient.send({ cmd: 'get_priority'}, {}));
      return priority;
    }catch (err: unknown) {
      const payload = normalizeRemoteError(err);
      throw new HttpException(
        { error: payload },
        typeof payload.status === 'number' ? payload.status : 500,
      );
    }
  }
}
