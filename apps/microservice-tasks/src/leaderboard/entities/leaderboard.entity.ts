import { Dashboard } from '@microservice-tasks/dashboard/entities/dashboard.entity';
import { PrimaryGeneratedColumn, Entity, Column, ManyToOne, Index } from 'typeorm';

@Entity('leaderboard')
@Index(['dashboard', 'userId'], { unique: true }) 
export class Leaderboard {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  userId: number;

  @ManyToOne(() => Dashboard, (dashboard) => dashboard.id, {
    onDelete: 'CASCADE',
  })
  dashboard: Dashboard;

  @Column({ default: 0 })
  totalPoints: number;

  @Column({ default: 0 })
  tasksCompleted: number;
}