import { StatusModel } from '../Status/status.model';
import { PriorityModel } from '../Priority/priority.model';

export interface TaskDTO {
  id: number;
  name: string;
  description?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  finishDate?: string | Date | null;
  statusId: number;
  priorityId: number;
  dashboardId: number;
  assignedToUserId?: number | null;
  reviewedByUserId?: number | null;
}

export interface TaskUpdateDTO {
  name: string;
  description?: string | null;
  endDate?: string | Date | null;
  finishDate?: string | Date | null;
  statusId: number;
  priorityId: number;
  assignedToUserId?: number | null;
  reviewedByUserId?: number | null;
}

export interface TaskCreateDTO {
  name: string;
  description?: string | null;
  endDate?: string | Date | null;
  finishDate?: string | Date | null;
  statusId: number;
  dashboardId: number;
  priorityId: number;
  assignedToUserId?: number | null;
}

export class TaskModel {
  id: number;
  name: string;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  finishDate: Date | null;
  statusId: number;
  priorityId: number;
  dashboardId: number;
  assignedToUserId: number | null;
  reviewedByUserId: number | null;

  // Optional: Keep rich objects for UI display/logic
  status?: StatusModel;
  priority?: PriorityModel;

  constructor(params: Partial<TaskModel>) {
    this.id = params.id ?? 0;
    this.name = params.name ?? '';
    this.description = params.description ?? null;
    this.startDate = params.startDate ?? null;
    this.endDate = params.endDate ?? null;
    this.finishDate = params.finishDate ?? null;
    this.statusId = params.statusId ?? 0;
    this.priorityId = params.priorityId ?? 0;
    this.dashboardId = params.dashboardId ?? 0;
    this.assignedToUserId = params.assignedToUserId ?? null;
    this.reviewedByUserId = params.reviewedByUserId ?? null;
    this.status = params.status;
    this.priority = params.priority;
  }

  static fromDTO(
    dto: TaskDTO,
    options?: {
      statusLookup?: (id: number) => StatusModel | undefined;
      priorityLookup?: (id: number) => PriorityModel | undefined;
    }
  ): TaskModel {
    const parseDate = (v: any): Date | null => {
      if (!v) return null;
      const d = v instanceof Date ? v : new Date(v);
      return isNaN(d.getTime()) ? null : d;
    };

    return new TaskModel({
      id: dto.id,
      name: dto.name,
      description: dto.description,
      startDate: parseDate(dto.startDate),
      endDate: parseDate(dto.endDate),
      finishDate: parseDate(dto.finishDate),
      statusId: dto.statusId,
      priorityId: dto.priorityId,
      dashboardId: dto.dashboardId,
      assignedToUserId: dto.assignedToUserId,
      reviewedByUserId: dto.reviewedByUserId,
      // Hydrate objects if lookups are provided
      status: options?.statusLookup?.(dto.statusId),
      priority: options?.priorityLookup?.(dto.priorityId),
    });
  }

  toDTO(): TaskDTO {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      startDate: this.startDate?.toISOString() ?? null,
      endDate: this.endDate?.toISOString() ?? null,
      finishDate: this.finishDate?.toISOString() ?? null,
      statusId: this.statusId,
      priorityId: this.priorityId,
      dashboardId: this.dashboardId,
      assignedToUserId: this.assignedToUserId,
      reviewedByUserId: this.reviewedByUserId,
    };
  }
  
  toCreateDTO(): TaskCreateDTO {
    return {
      name: this.name,
      description: this.description,
      endDate: this.endDate?.toISOString() ?? null,
      finishDate: this.finishDate?.toISOString() ?? null,
      statusId: this.statusId,
      priorityId: this.priorityId,
      dashboardId: this.dashboardId,
      assignedToUserId: this.assignedToUserId,
    };
  }

  toUpdateDTO(): TaskUpdateDTO {
    return {
      name: this.name,
      description: this.description,
      endDate: this.endDate?.toISOString() ?? null,
      finishDate: this.finishDate?.toISOString() ?? null,
      statusId: this.statusId,
      priorityId: this.priorityId,
      assignedToUserId: this.assignedToUserId,
      reviewedByUserId: this.reviewedByUserId,
    };
  }
}