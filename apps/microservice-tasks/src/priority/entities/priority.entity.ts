import { Task } from 'src/task/entities/task.entity';
import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Priority {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Task, (task) => task.priority)
  task: Task[];
}
