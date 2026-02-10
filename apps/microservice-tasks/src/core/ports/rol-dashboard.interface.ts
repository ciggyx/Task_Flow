import { ParticipantType } from '@microservice-tasks/participant-type/entities/participant-type.entity';
import { Dashboard } from '@microservice-tasks/dashboard/entities/dashboard.entity';
import { UpdateDashboardDto } from '@shared/dtos';
import { CreateRolDashboardDto } from '@microservice-tasks/rol-dashboard/dto/create-rol-dashboard.dto';
import { RolDashboard } from '@microservice-tasks/rol-dashboard/entities/rol-dashboard.entity';

export interface IRolDashboardRepository {
  create(createRolDashboardDto: CreateRolDashboardDto): Promise<RolDashboard>;

  findAll(): Promise<RolDashboard[]>;

  findOne(id: number): Promise<RolDashboard | null>;

  update(id: number, updateRolDashboardDto: UpdateDashboardDto): Promise<RolDashboard | null>;

  updateUserInDashboard(rolDashboard: Partial<RolDashboard>): Promise<RolDashboard>

  remove(id: number): Promise<void>;

  save(status: RolDashboard): Promise<RolDashboard>;

  merge(existingRolDashboard: RolDashboard, updateObject: Partial<RolDashboard>): RolDashboard;

  findOwnedByUserId(userId: number, participantType: ParticipantType): Promise<RolDashboard[]>;

  findSharedByUserId(userId: number, participantTypes: number[]): Promise<RolDashboard[]>;

  findUserRole(userId: number, dashboardId: number): Promise<RolDashboard | null>;

  findUsersInDashboard(dahsboardId: number): Promise<number[]>;

  count(): Promise<number>;

  removeUser(dashboardId : number, userId: number): Promise<void>;

  updateUserRole(userId: number, dashboardId:number, newRoleId:number): Promise<RolDashboard>;

  saveArray(
    rolDashboard: {
      dashboard: Dashboard;
      participantType: ParticipantType;
      userId: number;
    }[],
  ): Promise<RolDashboard[]>;
}
