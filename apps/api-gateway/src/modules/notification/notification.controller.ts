import { Controller, Get, Post, Body, Patch, UseGuards, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { User } from '@api-gateway/common/decorators/user.decorator';
import { CreateNotificationDto } from '@shared/dtos';
import { MessagePattern } from '@nestjs/microservices';
import { JwtRs256Guard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../authorization/permission.guard';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(JwtRs256Guard, PermissionsGuard) // <--- Solo aquí
  @Post('/create')
  create(
    @User('sub') userId: number, 
    @Body() createNotificationDto: CreateNotificationDto) {
      createNotificationDto.userId = userId;
    return this.notificationService.create(createNotificationDto);
  }

  // SIN GUARDS: Las comunicaciones entre microservicios son internas y confiables
  @MessagePattern({ cmd: 'create_notification' })
  createNotification(createNotificationDto: CreateNotificationDto ) {
    return this.notificationService.create(createNotificationDto);
  }

  @UseGuards(JwtRs256Guard, PermissionsGuard) // <--- Solo aquí
  @Get('my-notifications')
  getMyNotifications(@User('sub') userId: number) {
    return this.notificationService.getMyNotifications(userId);
  }

  @UseGuards(JwtRs256Guard, PermissionsGuard) // <--- Solo aquí
  @Patch(':id/read')
  readNotification(@Param('id') id: number) {
    return this.notificationService.readNotification(id);
  }

  @UseGuards(JwtRs256Guard, PermissionsGuard) // <--- Solo aquí
  @Patch('read-all')
  readAllNotification(@User('sub') id: number) {
    return this.notificationService.readAllNotifications(id);
  }
}