import { Controller } from '@nestjs/common/decorators/core';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { Get, Param, Patch, Post } from '@nestjs/common/decorators/http';
import { ParseIntPipe } from '@nestjs/common/pipes/parse-int.pipe';
import { AppNotification } from './entities/notification.entity';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateNotificationDto } from './dto/create-notification.dto';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva notificación'})
  @ApiResponse({ status: 201, type : AppNotification })
  create(createNotificationDto: CreateNotificationDto) {
    return this.service.create(createNotificationDto);
  }

  @MessagePattern({cmd : 'create_new_notification'})
  createNotification(@Payload() data: CreateNotificationDto){
    return this.service.create(data);
  }


  @Get(':userId')
  @ApiOperation({ summary: 'Obtener notificaciones de un usuario' })
  @ApiResponse({ status: 200, type: [AppNotification] })
  findAll(@Param('userId', ParseIntPipe) userId: number) {
    return this.service.getMyNotifications(userId);
  }

  @MessagePattern({cmd : 'get_my_notifications'})
  getNotifications(@Payload() data: number) {
    return this.service.getMyNotifications(data);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar notificación como leída' })
  markRead(@Param('id', ParseIntPipe) id: number) {
    return this.service.readNotification(id);
  }

  @MessagePattern({cmd : 'read_notification'})
  checkAsRead(@Payload() data: number){
    return this.service.readNotification(data);
  }
}