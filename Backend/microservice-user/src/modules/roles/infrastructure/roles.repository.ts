import { Injectable } from '@nestjs/common';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Role } from '../entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RoleRepository {
  constructor(
    @InjectRepository(Role)
    private readonly repo: Repository<Role>,
  ) {}

  create(rol: Partial<Role>): Role {
    return this.repo.create(rol);
  }

  save(rol: Role): Promise<Role> {
    return this.repo.save(rol);
  }

  findAll(): Promise<Role[]> {
    return this.repo.find();
  }

  findOne(id: number, relations?: string[]): Promise<Role | null> {
    return this.repo.findOne({ where: { id }, relations: relations });
  }

  findOneBy(code: string): Promise<Role | null> {
    return this.repo.findOneBy({ code: code });
  }

  delete(id: number): Promise<DeleteResult> {
    return this.repo.delete(id);
  }

  update(id: number, data: Partial<Role>): Promise<UpdateResult> {
    return this.repo.update(id, data);
  }
}
