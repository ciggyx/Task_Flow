import { PartialType } from '@nestjs/swagger';
import { CreateRolDashboardDto } from './create-rol-dashboard.dto';

export class UpdateRolDashboardDto extends PartialType(CreateRolDashboardDto) {}
