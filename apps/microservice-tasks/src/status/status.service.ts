import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Status } from './entities/status.entity';
import { DeleteStatusDto } from './dto/delete-status.dto';
import { STATUS_REPO, TASK_REPO } from '@microservice-tasks/core/ports/tokens';
import { IStatusRepository } from '@microservice-tasks/core/ports/status.interface';
import { ITaskRepository } from '@microservice-tasks/core/ports/task.interface';

@Injectable()
export class StatusService {
  constructor(
    @Inject(STATUS_REPO)
    private readonly statusRepository: IStatusRepository,

    @Inject(TASK_REPO)
    private readonly taskRepository: ITaskRepository,
  ) { }
  async create(createStatusDto: CreateStatusDto): Promise<Status> {
    return this.statusRepository.create(createStatusDto);
  }

  findAll() {
    return this.statusRepository.findAll();
  }

  findOne(id: number) {
    return this.statusRepository.findOne(id);
  }

  update(id: number, updateStatusDto: UpdateStatusDto) {
    return this.statusRepository.update(id, updateStatusDto);
  }

  async remove(id: number): Promise<DeleteStatusDto> {
    const statusExist = await this.statusRepository.findOne(id);
    if (!statusExist) {
      throw new NotFoundException(`Status ${id} not found`);
    }
    const defaultStatus = await this.statusRepository.findOneByName('Undefined');

    if (!defaultStatus)
      throw new NotFoundException(`Status undefined is not created. Please run seed`);

    const tasksWithCurrentStatus = await this.taskRepository.findAllWithStatusId(id);

    await Promise.all(
      tasksWithCurrentStatus.map((task) =>
        this.taskRepository.updateOnlyStatus(task.id, defaultStatus.id),
      ),
    );

    await this.statusRepository.delete(id);

    return { message: 'Status deleted successfully', deletedId: id };
  }
}
