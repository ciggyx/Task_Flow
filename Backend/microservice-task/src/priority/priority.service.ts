import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePriorityDto } from './dto/create-priority.dto';
 import { UpdatePriorityDto } from './dto/update-priority.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Priority } from './entities/priority.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PriorityService {
  constructor(
    @InjectRepository(Priority)
    private readonly priorityRepository: Repository<Priority>,
  ) {}

  async create(createPriorityDto: CreatePriorityDto): Promise<Priority> {
    const newPriority = this.priorityRepository.create(createPriorityDto);
    return await this.priorityRepository.save(newPriority);
  }

  findAll() {
    return this.priorityRepository.find();
  }

  findOne(id: number) {
    return this.priorityRepository.findOne({ where: { id } });
  }

  update(id: number, updatePriorityDto: UpdatePriorityDto) {
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const priorityExist = await this.priorityRepository.findOne({
      where: { id },
    });
    if (!priorityExist) {
      throw new NotFoundException(`Priority with ${id} not exist`);
    }
    await this.priorityRepository.delete(id);
  }
}
