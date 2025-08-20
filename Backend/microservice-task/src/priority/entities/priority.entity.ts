import { Task } from 'src/task/entities/task.entity';
import { Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
export class Priority {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @OneToMany(() => Task, (task) => task.priority)
  task: Task;

  constructor(id: number, name: string, descrption: string) {
    this.id = id;
    this.name = name;
    this.description = this.description;
  }
}
