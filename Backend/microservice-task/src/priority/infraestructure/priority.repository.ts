import { InjectRepository } from '@nestjs/typeorm';
import { CreatePriorityDto } from '../dto/create-priority.dto';
import { UpdatePriorityDto } from '../dto/update-priority.dto';
import { Priority } from '../entities/priority.entity';
import { IPriorityRepository } from './priority.interface';
import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class PriorityRepository implements IPriorityRepository {
  constructor(
    @InjectRepository(Priority)
    private readonly priorityRepository: Repository<Priority>,
  ) {}

  create(createPriorityDto: CreatePriorityDto): Priority {
    return this.priorityRepository.create(createPriorityDto);
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

  async update(
    id: number,
    updatePriorityDto: UpdatePriorityDto,
  ): Promise<Priority | null> {
    const priority = await this.priorityRepository.findOne({ where: { id } });
    if (!priority) throw new NotFoundException(`Priority not found`);

    return await this.priorityRepository.save({
      ...priority,
      ...updatePriorityDto,
    });
  }

  async remove(id: number): Promise<void> {
    await this.priorityRepository.delete(id);
  }
}
