import { Task } from 'src/task/entities/task.entity';
import {
  Entity,
  Column,
  OneToMany,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Dashboard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @OneToMany(() => Task, (task) => task.dashboard, { eager: true })
  @JoinColumn({ name: 'taskId' })
  task: Task | null;
}
