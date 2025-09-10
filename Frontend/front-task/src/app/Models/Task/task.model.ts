import { StatusModel } from '../Status/status.model';
import { PriorityModel } from '../Priority/priority.model';

export interface TaskDTO {
  id: number;
  dashboardId: number;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  finishDate?: string | null;
  statusId?: number | null;
  priorityId?: number | null;
  status?: { id: number; name: string } | number | null;
  priority?: { id: number; name: string } | number | null;
  description?: string | null;
  userId?: number | null;
}

export class TaskModel {
  id: number;
  dashboardId: number;
  name: string;
  startDate: Date | null;
  endDate: Date | null;
  finishDate: Date | null;
  status?: StatusModel | undefined;
  priority?: PriorityModel | undefined;
  description?: string | undefined;
  userId?: number | null;

  constructor(params: {
    id: number;
    dashboardId: number;
    name: string;
    startDate?: Date | null;
    endDate?: Date | null;
    finishDate?: Date | null;
    status?: StatusModel | undefined;
    priority?: PriorityModel | undefined;
    description?: string | undefined;
    userId?: number | null;
  }) {
    this.id = params.id;
    this.dashboardId = params.dashboardId;
    this.name = params.name;
    this.startDate = params.startDate ?? null;
    this.endDate = params.endDate ?? null;
    this.finishDate = params.finishDate ?? null;
    this.status = params.status;
    this.priority = params.priority;
    this.description = params.description;
    this.userId = params.userId ?? null;
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
      dashboardId: Number(dto.dashboardId),
      name: String(dto.name ?? ''),
      startDate: parseDate(dto.startDate),
      endDate: parseDate(dto.endDate),
      finishDate: parseDate(dto.finishDate),
      status,
      priority,
      description: dto.description ?? undefined,
      userId: dto.userId != null ? Number(dto.userId) : null
    });
  }


 toDTO(): TaskDTO {

    const dateToIso = (d: Date | null | undefined) => (d ? d.toISOString() : null);
    return {
      id: this.id,
      dashboardId: this.dashboardId,
      name: this.name,
      startDate: dateToIso(this.startDate),
      endDate: dateToIso(this.endDate),
      finishDate: dateToIso(this.finishDate),
      statusId: this.status ? this.status.id : undefined,
      priorityId: this.priority ? this.priority.id : undefined,
      status: this.status ? { id: this.status.id, name: this.status.name } : null,
      priority: this.priority ? { id: this.priority.id, name: this.priority.name } : null,
      description: this.description ?? null,
      userId: this.userId ?? null
    };


}

}