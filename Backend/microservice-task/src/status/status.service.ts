import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Status } from './entities/status.entity';
import { IStatusRepository } from './infraestructure/status.interface';
import { ITaskRepository } from 'src/task/infraestructure/task.interface';
import { DeleteStatusDto } from './dto/delete-status.dto';

@Injectable()
export class StatusService {
  constructor(
    @Inject('IStatusRepository')
    private readonly statusRepository: IStatusRepository,
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}
  async create(createStatusDto: CreateStatusDto): Promise<Status> {
    const newStatus = this.statusRepository.create(createStatusDto);
    return await this.statusRepository.save(newStatus);
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
    const defaultStatus =
      await this.statusRepository.findOneByName('Undefined');

    if (!defaultStatus)
      throw new NotFoundException(
        `Status undefined is not created. Please run seed`,
      );

    const tasksWithCurrentStatus =
      await this.taskRepository.findAllWithStatusId(id);

    await Promise.all(
      tasksWithCurrentStatus.map((task) =>
        this.taskRepository.updateOnlyStatus(task.id, defaultStatus.id),
      ),
    );

    await this.statusRepository.delete(id);

    return { message: 'Status deleted successfully', deletedId: id };
  }
}
