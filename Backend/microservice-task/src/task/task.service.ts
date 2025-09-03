import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';
import { Priority } from 'src/priority/entities/priority.entity';
import { Status } from 'src/status/entities/status.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(Priority)
    private readonly priorityRepository: Repository<Priority>,

    @InjectRepository(Status)
    private readonly statusRepository: Repository<Status>,
  ) {}
  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const { name, description, priorityId, endDate, statusId } = createTaskDto;

    const defaultStatusId = 2;

    const status = await this.statusRepository.findOneBy({
      id: statusId || defaultStatusId,
    });
    if (!status) {
      throw new NotFoundException(
        `Status con id ${statusId ?? defaultStatusId} no existe`,
      );
    }
    let priority: Priority | undefined = undefined;

    if (priorityId) {
      const foundPriority = await this.priorityRepository.findOneBy({
        id: priorityId,
      });

      if (!foundPriority) {
        throw new NotFoundException(`Priority con id ${priorityId} no existe`);
      }
      priority = foundPriority;
    }

    const task = this.taskRepository.create({
      name,
      description,
      endDate,
      startDate: new Date(),
      status,
      priority: priority,
    });

    return await this.taskRepository.save(task);
  }

  findAll() {
    return this.taskRepository.find();
  }

  findOne(id: number) {
    return this.taskRepository.findOne({ where: { id } });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updateTaskDto: UpdateTaskDto) {
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const taskExist = await this.taskRepository.findOne({ where: { id } });
    if (!taskExist) {
      throw new NotFoundException(`Task with ${id} not found`);
    }
    await this.taskRepository.delete(id);
  }
}
