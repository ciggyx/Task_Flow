import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('notifications')
export class AppNotification {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 123 })
  @Column()
  userId: number;

  @ApiProperty({ example: 'invite' })
  @Column({ length: 50 })
  type: string;

  @ApiProperty({ example: 'Nueva Invitación' })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({ example: 'Has sido invitado al dashboard...' })
  @Column('text', { nullable: true })
  message: string;

  @ApiProperty({ example: false })
  @Column({ default: false })
  isRead: boolean;

  @ApiProperty({ example: 10, required: false })
  @Column({ nullable: true })
  relatedResourceId: number;

  @ApiProperty({ example: '2024-05-20T10:00:00Z' })
  @CreateDateColumn()
  createdAt: Date;
}