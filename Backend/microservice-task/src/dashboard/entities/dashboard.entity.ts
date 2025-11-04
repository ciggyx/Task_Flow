import { Task } from 'src/task/entities/task.entity';
import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Dashboard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @OneToMany(() => Task, (task) => task.dashboard, {
    cascade: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  task: Task[];
}
