import { Injectable } from '@nestjs/common';
import { DeleteResult, In, Repository, UpdateResult } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PermissionRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly repo: Repository<Permission>,
  ) {}

  create(permission: Partial<Permission>): Permission {
    return this.repo.create(permission);
  }

  save(permission: Permission): Promise<Permission> {
    return this.repo.save(permission);
  }

  findAll(): Promise<Permission[]> {
    return this.repo.find();
  }

  findOne(id: number): Promise<Permission | null> {
    return this.repo.findOne({ where: { id } });
  }

  findBy(permissionIds: number[]): Promise<Permission[]> {
    return this.repo.findBy({
      id: In(permissionIds),
    });
  }

  delete(id: number): Promise<DeleteResult> {
    return this.repo.delete(id);
  }

  update(id: number, data: Partial<Permission>): Promise<UpdateResult> {
    return this.repo.update(id, data);
  }
  findByName(name: string): Promise<Permission | null> {
    return this.repo.findOne({ where: { name } });
  }
}
