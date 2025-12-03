import { Task } from '@microservice-tasks/task/entities/task.entity';
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
    // Lo seteo a falso porque en verdadero siempre carga las tareas
    // en los find del repository, si se necesitan las tareas se deberia
    // utilizar la opción de relations.
    eager: false,
  })
  task: Task[];
}
