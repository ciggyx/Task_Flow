import { Controller, Get, Post, Body, Patch, UseGuards, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { User } from '@api-gateway/common/decorators/user.decorator';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { MessagePattern } from '@nestjs/microservices';
import { JwtRs256Guard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../authorization/permission.guard';

@UseGuards(JwtRs256Guard, PermissionsGuard)
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('/create')
  create(
    @User('sub') userId: number, 
    @Body() createNotificationDto: CreateNotificationDto) {
      createNotificationDto.userId = userId;
    return this.notificationService.create(createNotificationDto);
  }

  @MessagePattern ({ cmd : 'create_notification'})
  createNotification(data: { userId : number, createNotificationDto: CreateNotificationDto}){
    data.createNotificationDto.userId = data.userId;
    return this.notificationService.create(data.createNotificationDto);
  }

  @Get('my-notifications')
  getMyNotifications(@User('sub') userId: number){
    return this.notificationService.getMyNotifications(userId);
  }

  @Patch(':id/read')
  readNotification(@Param('id')id : number){
    return this.notificationService.readNotification(id);
  }

}
