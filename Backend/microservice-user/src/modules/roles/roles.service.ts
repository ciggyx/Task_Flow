import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from './entities/role.entity';
import { DeleteResult } from 'typeorm';
import { UpdateRoleDto } from './dto/update-role.dto';
import { IPermissionRepository } from '../permissions/infrastructure/permission.interface';
import { IRoleRepository } from './infrastructure/roles.interface';

@Injectable()
export class RolesService {
  constructor(
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const { permissions, ...rest } = createRoleDto;

    const permissionIds = permissions!.map((p) => p.id); // Confia
    if (!rest.code || !rest.name || !rest.description) {
      throw new BadRequestException('Code, name and description are required');
    }

    if (permissionIds.length === 0) {
      throw new NotFoundException('Permissions not found');
    }

    const foundPermissions =
      await this.permissionRepository.findBy(permissionIds);

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

    return this.roleRepository.create({
      ...rest,
      permissions: foundPermissions,
    });
  }

  findAll(): Promise<Role[]> {
    return this.roleRepository.findAll();
  }

  async findOne(id: number): Promise<Role> {
    if (!id) {
      throw new NotFoundException(`ID is required`);
    }

    const role = await this.roleRepository.findOne(id);
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
      throw new BadRequestException(
        'Code, name, description or permissions are required',
      );
    }

    const role = await this.roleRepository.findOne(id, ['permissions']);

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    if (permissions != undefined && permissions.length > 0) {
      const permissionIds = permissions.map((p) => p.id);

      const foundPermissions =
        await this.permissionRepository.findBy(permissionIds);

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

    return this.roleRepository.save(role);
  }

  async remove(id: number): Promise<void> {
    if (!id) {
      throw new NotFoundException(`ID is required`);
    }

    const role = await this.roleRepository.findOne(id);

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return await this.roleRepository.delete(role.id);
  }
}
