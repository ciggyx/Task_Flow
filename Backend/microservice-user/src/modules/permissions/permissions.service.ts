import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PermissionRepository } from './infrastructure/permission.repository';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private readonly permissionRepo: PermissionRepository) {}

  async create(permissionDto: CreatePermissionDto): Promise<Permission> {
    if (!permissionDto.name || !permissionDto.description) {
      throw new Error('Name and description are required');
    }

    const existing = await this.permissionRepo.findByName(permissionDto.name);

    if (existing) {
      throw new ConflictException('Permission with this name already exists');
    }

    try {
      const permission = this.permissionRepo.create(permissionDto);
      return await this.permissionRepo.save(permission);
    } catch (error) {
      throw new Error('Error creating permission');
    }
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
    if (!data.name || !data.description) {
      throw new Error('Name and description are required');
    }
    await this.findOne(id);
    await this.permissionRepo.update(id, data);
  }

  async remove(id: number): Promise<void> {
    if (!id) {
      throw new Error('ID is required');
    }
    await this.findOne(id);
    await this.permissionRepo.delete(id);
  }
}
