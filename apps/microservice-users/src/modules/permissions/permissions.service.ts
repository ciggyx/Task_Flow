import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { IPermissionRepository } from '../core/ports/permission.port';
import { PERMISSION_REPO } from '../core/ports/tokens';

@Injectable()
export class PermissionsService {
  constructor(
    @Inject(PERMISSION_REPO)
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async create(permissionDto: CreatePermissionDto): Promise<Permission> {
    if (!permissionDto.name || !permissionDto.description) {
      throw new Error('Name and description are required');
    }

    const existing = await this.permissionRepository.findOneByName(permissionDto.name);

    if (existing) {
      throw new ConflictException('Permission with this name already exists');
    }

    try {
      return this.permissionRepository.create(permissionDto);
    } catch (_error) {
      throw new Error('Error creating permission');
    }
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.findAll();
  }

  async findOne(id: number): Promise<Permission> {
    const perm = await this.permissionRepository.findOne(id);
    if (!perm) throw new NotFoundException('Permission not found');
    return perm;
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto): Promise<void> {
    if (!updatePermissionDto.name || !updatePermissionDto.description) {
      throw new Error('Name and description are required');
    }
    await this.findOne(id);
    await this.permissionRepository.update(id, updatePermissionDto);
  }

  async remove(id: number): Promise<void> {
    if (!id) {
      throw new Error('ID is required');
    }
    await this.permissionRepository.delete(id);
  }
}
