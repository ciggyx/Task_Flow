import { CreateDashboardDto } from '../../../../../libs/shared/dtos/src/lib/dashboard/create-dashboard.dto';
import { Dashboard } from '../entities/dashboard.entity';
import { UpdateDashboardDto } from '../../../../../libs/shared/dtos/src/lib/dashboard/update-dashboard.dto';
import { RolDashboard } from '@microservice-tasks/rol-dashboard/entities/rol-dashboard.entity';

export interface IDashboardRepository {
  create(createDashboard: CreateDashboardDto): Promise<Dashboard>;

  findAll(): Promise<Dashboard[]>;

  findOne(id: number): Promise<Dashboard | null>;

  findOneWithTasks(id: number): Promise<Dashboard | null>;

  update(id: number, updateDashboardDto: UpdateDashboardDto): Promise<Dashboard | null>;

  remove(id: number): Promise<void>;

  findDashboardByRolDashboard(idDashboards: RolDashboard[]): Promise<Dashboard[]>;

  count(): Promise<number>;

  saveArray(dashboard: { name: string; description: string }[]): Promise<Dashboard[]>;
}
