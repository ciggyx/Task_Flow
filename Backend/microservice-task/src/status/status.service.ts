import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Status } from './entities/status.entity';

@Injectable()
export class StatusService {
  constructor(
    @InjectRepository(Status)
    private readonly statusRepository: Repository<Status>,
  ) {}
  async create(createStatusDto: CreateStatusDto): Promise<Status> {
    const newStatus = this.statusRepository.create(createStatusDto);
    return await this.statusRepository.save(newStatus);
  }

  findAll() {
    return this.statusRepository.find();
  }

  findOne(id: number) {
    return this.statusRepository.findOne({ where: { id } });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updateStatusDto: UpdateStatusDto) {
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const statusExist = await this.statusRepository.findOne({ where: { id } });
    if (!statusExist) {
      throw new NotFoundException(`Status ${id} not found`);
    }
    await this.statusRepository.delete(id);
  }
}
