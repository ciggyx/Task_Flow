import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { RoleRepository } from './infrastructure/roles.repository';
import { PermissionRepository } from '../permissions/infrastructure/permission.repository';
import { Role } from './entities/role.entity';
import { DeleteResult } from 'typeorm';
import { UpdateRoleDto } from './dto/update-role.dto';
import { isNull, isUndefined } from 'util';

@Injectable()
export class RolesService {
  constructor(
    private readonly rolRepo: RoleRepository,
    private readonly permissionRepo: PermissionRepository,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const { permissions, ...rest } = createRoleDto;

    const permissionIds = permissions.map((p) => p.id);
    if (!rest.code || !rest.name || !rest.description) {
      throw new BadRequestException('Code, name and description are required');
    }

    if (permissionIds.length === 0) {
      throw new NotFoundException('Permissions not found');
    }

    const foundPermissions = await this.permissionRepo.findBy(permissionIds);

    if (foundPermissions.length !== permissionIds.length) {
      throw new NotFoundException('Some permissions do not exist');
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

  async findOne(id: number): Promise<Role> {
    if (!id ||  isNull(id) || isUndefined(id)) {
      throw new NotFoundException(`ID is required`);
    }
    const role = await this.rolRepo.findOne(id);
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async update(id: number, dto: UpdateRoleDto): Promise<Role> {
    const { permissions, ...rest } = dto;
    if (
      (!rest.code || rest.code.trim() === '') &&
      (!rest.name || rest.name.trim() === '') &&
      (!rest.description || rest.description.trim() === '') &&
      (permissions === undefined || permissions.length === 0)
    ) {
      throw new BadRequestException('Code, name, description or permissions are required');
    }

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
    if (!id) {
      throw new NotFoundException(`ID is required`);
    }
    const role = await this.rolRepo.findOne(id);

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return await this.rolRepo.delete(role.id);
  }
}
