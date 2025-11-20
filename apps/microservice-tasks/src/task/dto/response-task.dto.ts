// task.response.dto.ts
import { Task } from '../entities/task.entity';

export class TaskResponseDto {
  id: number;
  name: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  finishDate?: Date;
  status: { id: number };
  priority?: { id: number } | null;
  dashboard: { id: number };

  constructor(task: Task) {
    this.id = task.id;
    this.name = task.name;
    this.description = task.description;
    this.startDate = task.startDate;
    this.endDate = task.endDate;
    this.finishDate = task.finishDate;

    // Aquí mapeamos los IDs desde los objetos de relación
    this.status = { id: task.status.id };
    this.priority = task.priority ? { id: task.priority.id } : null;
    this.dashboard = { id: task.dashboard.id };
  }
}
