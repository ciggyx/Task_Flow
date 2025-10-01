import { Dashboard } from 'src/dashboard/entities/dashboard.entity';
import { ParticipantType } from 'src/participant-type/entities/participant-type.entity';
import {
  PrimaryGeneratedColumn,
  Entity,
  ManyToOne,
  Column,
  JoinColumn,
} from 'typeorm';

@Entity('rol_dashboard')
export class RolDashboard {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Dashboard, (dashboard) => dashboard.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'idDashboard' })
  dashboardId: Dashboard;

  @ManyToOne(() => ParticipantType, (participant) => participant.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'idRol' })
  participantTypeId: ParticipantType;

  // 3. ID del Usuario (Clave Externa)
  @Column({ name: 'idUser', type: 'bigint' })
  idUser: number;
}
