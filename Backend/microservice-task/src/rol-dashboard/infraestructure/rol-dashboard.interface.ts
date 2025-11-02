import { UpdateDashboardDto } from 'src/dashboard/dto/update-dashboard.dto';
import { CreateRolDashboardDto } from '../dto/create-rol-dashboard.dto';
import { RolDashboard } from '../entities/rol-dashboard.entity';

export interface IRolDashboardRepository {
  create(createRolDashboardDto: CreateRolDashboardDto): Promise<RolDashboard>;

  findAll(): Promise<RolDashboard[]>;

  findOne(id: number): Promise<RolDashboard | null>;

  update(
    id: number,
    updateRolDashboardDto: UpdateDashboardDto,
  ): Promise<RolDashboard | null>;

  remove(id: number): Promise<void>;

  save(status: RolDashboard): Promise<RolDashboard>;

  merge(
    existingRolDashboard: RolDashboard,
    updateObject: Partial<RolDashboard>,
  ): RolDashboard;
}
