import { HttpException, Inject, Injectable } from '@nestjs/common';
import { CreateNotificationDto } from '@shared/dtos';
import { normalizeRemoteError } from '../auth/error/normalize-remote-error';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices/client/client-proxy';


@Injectable()
export class NotificationService {
  constructor(@Inject('NOTIFICATIONS_SERVICE') private readonly notificationClient: ClientProxy,){    
  }
  async create(createNotificationDto: CreateNotificationDto){
    try{ const noti = await firstValueFrom(this.notificationClient.send({
      cmd : 'create_new_notification'}, createNotificationDto));
      console.log(noti);
      return noti;

    }catch(error){
      const payload = normalizeRemoteError(error);
      throw new HttpException(
          { error: payload },
          typeof payload.status === 'number' ? payload.status : 500,
      )
    }
  }

  async getMyNotifications(userId: number) {
    try{ const notis = await firstValueFrom(this.notificationClient.send({
      cmd : 'get_my_notifications'}, userId));
      return notis;

    }catch(error){
      const payload = normalizeRemoteError(error);
      throw new HttpException(
          { error: payload },
          typeof payload.status === 'number' ? payload.status : 500,
      )
    }
  }

  async readNotification(id: number) {
    try{ const noti = await firstValueFrom(this.notificationClient.send({

      cmd : 'read_notification'}, id));
      return noti;

    }catch(error){
      const payload = normalizeRemoteError(error);
      throw new HttpException(
          { error: payload },
          typeof payload.status === 'number' ? payload.status : 500,
      )
    }
  }

  async readAllNotifications(id : number){
    try{ const noti = await firstValueFrom(this.notificationClient.send({

      cmd : 'read_all_notification'}, id));
      return noti;

    }catch(error){
      const payload = normalizeRemoteError(error);
      throw new HttpException(
          { error: payload },
          typeof payload.status === 'number' ? payload.status : 500,
      )
    }
  }
}
