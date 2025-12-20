import { CreateTaskDto } from '@shared/dtos';
import { UpdateTaskDto } from '@shared/dtos';
import { Task } from '../entities/task.entity';
import { TaskResponseDto } from '@shared/dtos';
import { Status } from '@microservice-tasks/status/entities/status.entity';
import { Priority } from '@microservice-tasks/priority/entities/priority.entity';
import { Dashboard } from '@microservice-tasks/dashboard/entities/dashboard.entity';

export interface ITaskRepository {
  create(createTaskDto: CreateTaskDto): Promise<Task>;

  findOne(id: number): Promise<Task | null>;

  findAll(): Promise<Task[]>;

  findAllWithStatusId(id: number): Promise<Task[]>;

  findAllWithPriorityId(id: number): Promise<Task[]>;

  findAllWithDashboardId(id: number): Promise<Task[]>;

  update(id: number, updateTaskDto: UpdateTaskDto): Promise<TaskResponseDto>;

  updateOnlyStatus(id: number, statusId: number): Promise<TaskResponseDto>;

  updateOnlyPriority(id: number, priorityId: number): Promise<TaskResponseDto>;

  remove(id: number): Promise<void>;

  save(task: Task): Promise<Task>;

  count(): Promise<number>;

  saveArray(
    task: {
      name: string;
      description: string;
      startDate: Date;
      endDate: Date | null;
      status: Status;
      priority: Priority;
      dashboard: Dashboard;
    }[],
  ): Promise<Task[]>;
}
