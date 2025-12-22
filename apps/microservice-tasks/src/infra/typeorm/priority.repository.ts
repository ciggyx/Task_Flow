import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { IPriorityRepository } from '@microservice-tasks/core/ports/priority.interface';
import { Priority } from '@microservice-tasks/priority/entities/priority.entity';
import { CreatePriorityDto } from '@microservice-tasks/priority/dto/create-priority.dto';
import { UpdatePriorityDto } from '@microservice-tasks/priority/dto/update-priority.dto';

@Injectable()
export class PriorityRepository implements IPriorityRepository {
  constructor(
    @InjectRepository(Priority)
    private readonly priorityRepository: Repository<Priority>,
  ) { }
  saveArray(priority: { name: string }[]): Promise<Priority[]> {
    return this.priorityRepository.save(priority);
  }

  count(): Promise<number> {
    return this.priorityRepository.count();
  }

  create(createPriorityDto: CreatePriorityDto): Promise<Priority> {
    const priority = this.priorityRepository.create(createPriorityDto);
    return this.priorityRepository.save(priority);
  }

  save(priority: Priority): Promise<Priority> {
    return this.priorityRepository.save(priority);
  }

  findAll(): Promise<Priority[]> {
    return this.priorityRepository.find();
  }

  findOne(id: number): Promise<Priority | null> {
    return this.priorityRepository.findOne({ where: { id } });
  }

  findOneByName(name: string): Promise<Priority | null> {
    return this.priorityRepository.findOne({ where: { name: name } });
  }

  async update(id: number, updatePriorityDto: UpdatePriorityDto): Promise<Priority | null> {
    const priority = await this.priorityRepository.preload({
      id,
      ...updatePriorityDto,
    });
    if (!priority) throw new NotFoundException(`Priority not found`);

    return this.priorityRepository.save(priority);
  }

  async remove(id: number): Promise<void> {
    await this.priorityRepository.delete(id);
  }
}
