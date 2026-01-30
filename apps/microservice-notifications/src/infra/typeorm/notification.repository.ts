// infra/typeorm/notification.repository.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { INotificationRepository } from '../../core/ports/notification.interface';
import { AppNotification } from '../../notification/entities/notification.entity';
import { CreateNotificationDto } from '../../notification/dto/create-notification.dto';

@Injectable()
export class AppNotificationRepository implements INotificationRepository {
  constructor(
    @InjectRepository(AppNotification)
    private readonly repo: Repository<AppNotification>,
  ) {}

  async create(dto: CreateNotificationDto): Promise<AppNotification> {
    const notif = this.repo.create(dto);
    return await this.repo.save(notif);
  }

  async findAllByUserId(userId: number): Promise<AppNotification[]> {
    return await this.repo.find({
      where: { userId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<AppNotification | null> {
    return await this.repo.findOne({ where: { id } });
  }

  async markAsRead(id: number): Promise<AppNotification> {
    const notif = await this.findOne(id);
    if (!notif) throw new NotFoundException(`Notification ${id} not found`);
    notif.isRead = true;
    return await this.repo.save(notif);
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.repo.update({ userId: userId, isRead: false }, { isRead: true });
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}