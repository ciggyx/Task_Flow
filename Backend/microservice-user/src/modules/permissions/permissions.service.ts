import { Injectable, NotFoundException } from '@nestjs/common';
import { PermissionRepository } from './infrastructure/permission.repository';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private readonly permissionRepo: PermissionRepository) {}

  async create(permissionDto: CreatePermissionDto): Promise<Permission> {
    const permission = this.permissionRepo.create(permissionDto);
    return this.permissionRepo.save(permission);
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionRepo.findAll();
  }

  async findOne(id: number): Promise<Permission> {
    const perm = await this.permissionRepo.findOne(id);
    if (!perm) throw new NotFoundException('Permission not found');
    return perm;
  }

  async update(id: number, data: Partial<Permission>): Promise<void> {
    await this.findOne(id);
    await this.permissionRepo.update(id, data);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.permissionRepo.delete(id);
  }
}
