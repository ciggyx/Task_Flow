import { CreateRolDashboardDto } from '../dto/create-rol-dashboard.dto';
import { RolDashboard } from '../entities/rol-dashboard.entity';
import { ParticipantType } from '@microservice-tasks/participant-type/entities/participant-type.entity';
import { Dashboard } from '@microservice-tasks/dashboard/entities/dashboard.entity';
import { UpdateDashboardDto } from '@shared/dtos';

export interface IRolDashboardRepository {
  create(createRolDashboardDto: CreateRolDashboardDto): Promise<RolDashboard>;

  findAll(): Promise<RolDashboard[]>;

  findOne(id: number): Promise<RolDashboard | null>;

  update(id: number, updateRolDashboardDto: UpdateDashboardDto): Promise<RolDashboard | null>;

  remove(id: number): Promise<void>;

  save(status: RolDashboard): Promise<RolDashboard>;

  merge(existingRolDashboard: RolDashboard, updateObject: Partial<RolDashboard>): RolDashboard;

  findOwnedByUserId(userId: number, participantType: ParticipantType): Promise<RolDashboard[]>;

  findSharedByUserId(userId: number, participantTypes: number[]): Promise<RolDashboard[]>;

  findUsersInDashboard(dahsboard: Dashboard): Promise<number[]>;

  count(): Promise<number>;

  saveArray(
    rolDashboard: {
      dashboardId: Dashboard;
      participantTypeId: ParticipantType;
      idUser: number;
    }[],
  ): Promise<RolDashboard[]>;
}
