import { CreateDashboardDto } from '../dto/create-dashboard.dto';
import { Dashboard } from '../entities/dashboard.entity';
import { UpdateDashboardDto } from '../dto/update-dashboard.dto';

export interface IDashboardRepository {
  create(createDashboard: CreateDashboardDto): Promise<Dashboard>;

  findAll(): Promise<Dashboard[]>;

  findOne(id: number): Promise<Dashboard | null>;

  findOneWithTasks(id: number): Promise<Dashboard | null>;

  update(
    id: number,
    updateDashboardDto: UpdateDashboardDto,
  ): Promise<Dashboard | null>;

  remove(id: number): Promise<void>;
}
