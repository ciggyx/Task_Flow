import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { RoleRepository } from './infrastructure/roles.repository';
import { PermissionRepository } from '../permissions/infrastructure/permission.repository';
import { Role } from './entities/role.entity';
import { DeleteResult } from 'typeorm';

@Injectable()
export class RolesService {
  constructor(
    private readonly rolRepo: RoleRepository,
    private readonly permissionRepo: PermissionRepository,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const { permissions, ...rest } = createRoleDto;

    const permissionIds = permissions.map((p) => p.id);

    if (permissionIds.length === 0) {
      throw new NotFoundException('Permissions not found');
    }

    const foundPermissions = await this.permissionRepo.findBy(permissionIds);

    if (foundPermissions.length === 0) {
      throw new NotFoundException('No matching permissions found');
    }

    const foundIds = foundPermissions.map((p) => p.id);

    const missingPermissions = permissionIds.filter(
      (id) => !foundIds.includes(id),
    );

    if (missingPermissions.length > 0) {
      throw new NotFoundException(
        `Permissions not found: ${missingPermissions.join(', ')}`,
      );
    }

    const role = this.rolRepo.create({
      ...rest,
      permissions: foundPermissions,
    });

    return this.rolRepo.save(role);
  }

  findAll(): Promise<Role[]> {
    return this.rolRepo.findAll();
  }

  findOne(id: number): Promise<Role | null> {
    return this.rolRepo.findOne(id);
  }

  async update(id: number, updateRoleDto: Partial<Role>): Promise<Role> {
    const { permissions, ...rest } = updateRoleDto;

    const role = await this.rolRepo.findOne(id, ['permissions']);

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    if (permissions != undefined && permissions.length > 0) {
      const permissionIds = permissions.map((p) => p.id);

      const foundPermissions = await this.permissionRepo.findBy(permissionIds);

      if (foundPermissions === null) {
        throw new NotFoundException(`Permissions not found`);
      }

      const foundIds = foundPermissions.map((p) => p.id);

      const missingPermissions = permissionIds.filter(
        (id) => !foundIds.includes(id),
      );
      if (missingPermissions.length > 0) {
        throw new NotFoundException(
          `Permissions not found: ${missingPermissions.join(', ')}`,
        );
      }

      role.permissions = foundPermissions;
    }

    Object.assign(role, rest);

    return this.rolRepo.save(role);
  }

  async remove(id: number): Promise<DeleteResult> {
    const role = await this.rolRepo.findOne(id);

    if (!role) {
      throw new NotFoundException(`This role with this ${id} not found`);
    }

    return await this.rolRepo.delete(role.id);
  }
}
