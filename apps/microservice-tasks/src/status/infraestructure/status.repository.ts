import { InjectRepository } from '@nestjs/typeorm';
import { CreateStatusDto } from '../dto/create-status.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { Status } from '../entities/status.entity';
import { IStatusRepository } from './status.interface';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

export class StatusRepository implements IStatusRepository {
  constructor(
    @InjectRepository(Status)
    private readonly statusRepository: Repository<Status>,
  ) {}

  saveArray(status: { name: string }[]): Promise<Status[]> {
    return this.statusRepository.save(status);
  }

  async count(): Promise<number> {
    return await this.statusRepository.count();
  }
  create(createStatusDto: CreateStatusDto): Promise<Status> {
    const status = this.statusRepository.create(createStatusDto);
    return this.statusRepository.save(status);
  }

  async findAll(): Promise<Status[]> {
    return await this.statusRepository.find();
  }

  findOne(id: number): Promise<Status | null> {
    return this.statusRepository.findOne({ where: { id } });
  }

  findOneByName(name: string): Promise<Status | null> {
    return this.statusRepository.findOne({ where: { name: name } });
  }

  async update(id: number, updatedStatusDto: UpdateStatusDto): Promise<Status | null> {
    const status = await this.statusRepository.save({
      id,
      ...updatedStatusDto,
    });
    if (!status) throw new NotFoundException('Status not found');
    return status;
  }

  async delete(id: number): Promise<void> {
    await this.statusRepository.delete(id);
    return;
  }

  async save(status: Status): Promise<Status> {
    return this.statusRepository.save(status);
  }
}
