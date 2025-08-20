import { Task } from 'src/task/entities/task.entity';
import { Column, OneToMany, PrimaryColumn } from 'typeorm';

export class Dashboard {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @OneToMany(() => Task, (task) => task.dashboard)
  task: Task;

  constructor(id: number, name: string, description: string) {
    this.name = name;
    this.description = description;
  }
}
