import { StatusModel } from '../Status/status.model';
import { PriorityModel } from '../Priority/priority.model';
import { UserModel } from '../User/user.model';

export interface TaskDTO {
  id: number;
  dashboard: {id: number};
  name: string;
  startDate?: Date | null;
  endDate?: Date | null;
  finishDate?: Date | null;
  statusId?: number | null;
  priorityId?: number | null;
  status?: { id: number | null } | number | null;
  priority?: { id: number | null } | number | null;
  description?: string | null;
  user?: {id: number | null} | null;
}

export class TaskModel {
  id: number;
  dashboardId: number;
  name: string;
  startDate: Date | null;
  endDate: Date | null;
  finishDate: Date | null;
  status?: StatusModel | undefined;
  priorityId: number | null;
  description?: string | undefined;
  userId: number | null;

  constructor(params: {
    id: number;
    dashboardId: number;
    name: string;
    startDate?: Date | null;
    endDate?: Date | null;
    finishDate?: Date | null;
    status?: StatusModel | undefined;
    priorityId: number | null;
    description?: string | undefined;
    userId: number | null;
  }) {
    this.id = params.id;
    this.dashboardId = params.dashboardId;
    this.name = params.name;
    this.startDate = params.startDate ?? null;
    this.endDate = params.endDate ?? null;
    this.finishDate = params.finishDate ?? null;
    this.status = params.status;
    this.priorityId = params.priorityId;
    this.description = params.description;
    this.userId = params.userId;
  }

 static fromDTO(
    dto: TaskDTO | any,
    options?: {
      statusLookup?: (id: number) => StatusModel | undefined;
      priorityLookup?: (id: number) => PriorityModel | undefined;
    }
  ): TaskModel {
    const parseDate = (v: any): Date | null => {
      if (v == null) return null;
      const d = v instanceof Date ? v : new Date(v);
      return isNaN(d.getTime()) ? null : d;
    };

    // Resolve status
    let status: StatusModel | undefined;
    if (dto.status && typeof dto.status === 'object') {
      status = StatusModel.fromDTO(dto.status);
    } else if (dto.statusId != null) {
      status = options?.statusLookup?.(Number(dto.statusId));
    } else if (typeof dto.status === 'number') {
      status = options?.statusLookup?.(Number(dto.status));
    }

    // Resolve priority
    let priority: PriorityModel | undefined;
    if (dto.priority && typeof dto.priority === 'object') {
      priority = PriorityModel.fromDTO(dto.priority);
    } else if (dto.priorityId != null) {
      priority = options?.priorityLookup?.(Number(dto.priorityId));
    } else if (typeof dto.priority === 'number') {
      priority = options?.priorityLookup?.(Number(dto.priority));
    }

    return new TaskModel({
      id: Number(dto.id),
      dashboardId: Number(dto.dashboard.id),
      name: String(dto.name ?? ''),
      startDate: parseDate(dto.startDate),
      endDate: parseDate(dto.endDate),
      finishDate: parseDate(dto.finishDate),
      status,
      priorityId: Number(dto.priorityId ?? priority?.id ?? null),
      description: dto.description ?? undefined,
      userId: Number(dto.user?.id ?? null)
    });
  }


 toDTO(): TaskDTO {

    return {
      id: this.id,
      dashboard: { id: this.dashboardId },
      name: this.name,
      startDate: this.startDate,
      endDate: this.endDate,
      finishDate: this.finishDate,
      status: this.status ? { id: this.status.id } : null,
      priority: { id: this.priorityId },
      description: this.description ?? null,
      user: { id: this.userId }
    };


}

}