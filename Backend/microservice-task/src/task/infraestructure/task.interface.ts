import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { Task } from '../entities/task.entity';
import { TaskResponseDto } from '../dto/response-task.dto';

export interface ITaskRepository {
  create(createTaskDto: CreateTaskDto): Task;

  findOne(id: number): Promise<Task | null>;

  findAll(): Promise<Task[]>;

  findAllWithStatusId(id: number): Promise<Task[]>;

  findAllWithPriorityId(id: number): Promise<Task[]>;

  update(id: number, updateTaskDto: UpdateTaskDto): Promise<TaskResponseDto>;

  updateOnlyStatus(id: number, statusId: number): Promise<TaskResponseDto>;

  updateOnlyPriority(id: number, priorityId: number): Promise<TaskResponseDto>;

  remove(id: number): Promise<string>;

  save(task: Task): Promise<Task>;
}
