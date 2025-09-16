import { CreateUserDto } from './../dto/create-user.dto';
import { Injectable } from '@nestjs/common';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  create(user: CreateUserDto): User {
    return this.repo.create(user);
  }

  save(user: CreateUserDto): Promise<User> {
    return this.repo.save(user);
  }

  findAll(): Promise<User[]> {
    return this.repo.find();
  }

  findByEmail(email: string, relations?: string[]): Promise<User | null> {
    return this.repo.findOne({ where: { email }, relations: relations });
  }

  findByName(name: string, relations?: string[]): Promise<User | null> {
    return this.repo.findOne({ where: { name }, relations: relations });
  }

  findOneBy(id: number): Promise<User | null> {
    return this.repo.findOneBy({ id: id });
  }

  delete(id: number): Promise<DeleteResult> {
    return this.repo.delete(id);
  }

  update(id: number, data: Partial<User>): Promise<UpdateResult> {
    return this.repo.update(id, data);
  }
}
