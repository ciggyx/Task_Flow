import { Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { Permission } from '../../permissions/entities/permission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePermissionDto } from '../../permissions/dto/create-permission.dto';
import { UpdatePermissionDto } from '../../permissions/dto/update-permission.dto';
import { IPermissionRepository } from '@microservice-users/modules/core/ports/permission.port';

@Injectable()
export class PermissionRepository implements IPermissionRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const permission = this.permissionRepository.create(createPermissionDto);
    return this.permissionRepository.save(permission);
  }

  save(permission: Permission): Promise<Permission> {
    return this.permissionRepository.save(permission);
  }

  findAll(): Promise<Permission[]> {
    return this.permissionRepository.find();
  }

  findOne(id: number): Promise<Permission | null> {
    return this.permissionRepository.findOne({ where: { id } });
  }

  findBy(permissionIds: number[]): Promise<Permission[]> {
    return this.permissionRepository.findBy({
      id: In(permissionIds),
    });
  }

  async delete(id: number): Promise<void> {
    await this.permissionRepository.delete(id);
    return;
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto): Promise<Permission | null> {
    const permission = await this.permissionRepository.save({
      id,
      ...updatePermissionDto,
    });
    if (!permission) throw new NotFoundException('Permission not found');
    return permission;
  }

  findOneByName(name: string): Promise<Permission | null> {
    return this.permissionRepository.findOne({ where: { name } });
  }
}
