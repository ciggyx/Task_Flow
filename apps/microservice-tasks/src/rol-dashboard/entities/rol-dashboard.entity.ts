import { Dashboard } from '@microservice-tasks/dashboard/entities/dashboard.entity';
import { ParticipantType } from '@microservice-tasks/participant-type/entities/participant-type.entity';
import { PrimaryGeneratedColumn, Entity, Column, ManyToOne } from 'typeorm';

@Entity('rol_dashboard')
export class RolDashboard {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Dashboard, (dashboard) => dashboard.id, {
    onDelete: 'CASCADE',
  })
  dashboard: Dashboard;

  @ManyToOne(() => ParticipantType, (participantType) => participantType.id)
  participantType: ParticipantType;

  @Column()
  userId: number;
}
