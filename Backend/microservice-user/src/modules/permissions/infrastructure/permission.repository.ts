import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PermissionRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly repo: Repository<Permission>,
  ) {}

  create(permission: Partial<Permission>) {
    return this.repo.create(permission);
  }

  save(permission: Permission) {
    return this.repo.save(permission);
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  delete(id: number) {
    return this.repo.delete(id);
  }

  update(id: number, data: Partial<Permission>) {
    return this.repo.update(id, data);
  }
}
