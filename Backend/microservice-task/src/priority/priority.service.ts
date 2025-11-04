import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePriorityDto } from './dto/create-priority.dto';
import { UpdatePriorityDto } from './dto/update-priority.dto';
import { Priority } from './entities/priority.entity';
import { IPriorityRepository } from './infraestructure/priority.interface';
import { DeletePriorityDto } from './dto/delete-priority.dto';
import { TaskRepository } from '../task/infraestructure/task.repository';

@Injectable()
export class PriorityService {
  constructor(
    @Inject('IPriorityRepository')
    private readonly priorityRepository: IPriorityRepository,
    @Inject('ITaskRepository')
    private readonly taskRepository: TaskRepository,
  ) {}

  async create(createPriorityDto: CreatePriorityDto): Promise<Priority> {
    return await this.priorityRepository.create(createPriorityDto);
  }

  findAll(): Promise<Priority[]> {
    return this.priorityRepository.findAll();
  }

  findOne(id: number): Promise<Priority | null> {
    return this.priorityRepository.findOne(id);
  }

  update(
    id: number,
    updatePriorityDto: UpdatePriorityDto,
  ): Promise<Priority | null> {
    return this.priorityRepository.update(id, updatePriorityDto);
  }

  async remove(id: number): Promise<DeletePriorityDto> {
    const priorityExist = await this.priorityRepository.findOne(id);
    if (!priorityExist)
      throw new NotFoundException(`Priority with ${id} not exist`);

    const defaultPriority =
      await this.priorityRepository.findOneByName('Undefined');

    if (!defaultPriority)
      throw new NotFoundException(
        `Priority undefined is not created. Please run seed.`,
      );

    const taskWithCurrentPriority =
      await this.taskRepository.findAllWithPriorityId(id);

    await Promise.all(
      taskWithCurrentPriority.map((task) =>
        this.taskRepository.updateOnlyPriority(task.id, defaultPriority.id),
      ),
    );

    await this.priorityRepository.remove(id);

    return { message: 'Priority deleted succesfully', deletedId: id };
  }
}
