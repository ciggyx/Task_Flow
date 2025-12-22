import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePriorityDto } from './dto/create-priority.dto';
import { UpdatePriorityDto } from './dto/update-priority.dto';
import { Priority } from './entities/priority.entity';
import { DeletePriorityDto } from './dto/delete-priority.dto';
import { PRIORITY_REPO, TASK_REPO } from '@microservice-tasks/core/ports/tokens';
import { IPriorityRepository } from '@microservice-tasks/core/ports/priority.interface';
import { ITaskRepository } from '@microservice-tasks/core/ports/task.interface';

@Injectable()
export class PriorityService {
  constructor(
    @Inject(PRIORITY_REPO)
    private readonly priorityRepository: IPriorityRepository,

    @Inject(TASK_REPO)
    private readonly taskRepository: ITaskRepository,
  ) { }

  async create(createPriorityDto: CreatePriorityDto): Promise<Priority> {
    return await this.priorityRepository.create(createPriorityDto);
  }

  findAll(): Promise<Priority[]> {
    return this.priorityRepository.findAll();
  }

  findOne(id: number): Promise<Priority | null> {
    return this.priorityRepository.findOne(id);
  }

  update(id: number, updatePriorityDto: UpdatePriorityDto): Promise<Priority | null> {
    return this.priorityRepository.update(id, updatePriorityDto);
  }

  async remove(id: number): Promise<DeletePriorityDto> {
    const priorityExist = await this.priorityRepository.findOne(id);
    if (!priorityExist) throw new NotFoundException(`Priority with ${id} not exist`);

    const defaultPriority = await this.priorityRepository.findOneByName('Undefined');

    if (!defaultPriority)
      throw new NotFoundException(`Priority undefined is not created. Please run seed.`);

    const taskWithCurrentPriority = await this.taskRepository.findAllWithPriorityId(id);

    await Promise.all(
      taskWithCurrentPriority.map((task) =>
        this.taskRepository.updateOnlyPriority(task.id, defaultPriority.id),
      ),
    );

    await this.priorityRepository.remove(id);

    return { message: 'Priority deleted succesfully', deletedId: id };
  }
}
