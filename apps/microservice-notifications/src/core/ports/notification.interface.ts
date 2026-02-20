import { CreateNotificationDto } from '@shared/dtos';
import { AppNotification } from '../../notification/entities/notification.entity';

export interface INotificationRepository {
  create(dto: CreateNotificationDto): Promise<AppNotification>;
  findAllByUserId(userId: number): Promise<AppNotification[]>;
  findOne(id: number): Promise<AppNotification | null>;
  markAsRead(id: number): Promise<AppNotification>;
  markAllAsRead(userId: number): Promise<{ success: boolean; count?: number }>;
  delete(id: number): Promise<void>;
}

export const NOTIFICATION_REPO = 'NOTIFICATION_REPOSITORY_TOKEN';