import { Dashboard } from 'src/dashboard/entities/dashboard.entity';
import { Priority } from 'src/priority/entities/priority.entity';
import { Status } from 'src/status/entities/status.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column({ nullable: true })
  finishDate: Date;

  @Column()
  statusId: number;

  @Column({ nullable: true })
  priorityId: number;

  @Column()
  dashboardId: number;

  // el eager: true lo que hace es traer el objeto entero :|
  @ManyToOne(() => Status, (status) => status.task)
  @JoinColumn({ name: 'statusId' })
  status: Status;

  @ManyToOne(() => Priority, (priority) => priority.task)
  @JoinColumn({ name: 'priorityId' })
  priority: Priority | null;

  @ManyToOne(() => Dashboard, (dashboard) => dashboard.task, {
    nullable: false,
  })
  @JoinColumn({ name: 'dashboardId' })
  dashboard: Dashboard;
}
