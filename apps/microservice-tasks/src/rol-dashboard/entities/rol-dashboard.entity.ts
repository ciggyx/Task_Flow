import { Dashboard } from '@microservice-tasks/dashboard/entities/dashboard.entity';
import { PrimaryGeneratedColumn, Entity, Column, ManyToOne } from 'typeorm';

@Entity('rol_dashboard')
export class RolDashboard {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToOne(() => Dashboard, (dashboard) => dashboard.id)
  dashboard: Dashboard;

  @Column({ name: 'idRol', type: 'bigint' })
  participantTypeId: number;

  @Column({
    name: 'idUser',
    type: 'bigint',
    transformer: {
      to: (value) => value,
      from: (value) => parseInt(value)
    }
  })
  idUser: number;
}
