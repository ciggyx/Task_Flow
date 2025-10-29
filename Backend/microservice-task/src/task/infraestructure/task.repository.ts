import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';
import { ITaskRepository } from './task.interface';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';

@Injectable()
export class TaskRepository implements ITaskRepository {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  create(createTaskDto: CreateTaskDto): Task {
    return this.taskRepository.create(createTaskDto);
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    return await this.taskRepository.save({
      ...task,
      ...updateTaskDto,
    });
  }

  async remove(id: number): Promise<string> {
    await this.taskRepository.delete(id);
    return `Task deleted succesfully`;
  }

  findAll(): Promise<Task[]> {
    return this.taskRepository.find({
      relations: ['status', 'priority', 'dashboard'],
    });
  }

  async findOne(id: number): Promise<Task | null> {
    return this.taskRepository.findOne({
      where: { id },
      relations: ['status', 'priority', 'dashboard'],
    });
  }

  async save(task: Task): Promise<Task> {
    return this.taskRepository.save(task);
  }
}
