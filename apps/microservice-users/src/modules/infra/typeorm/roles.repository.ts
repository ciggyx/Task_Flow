import { Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRoleDto } from '../../roles/dto/create-role.dto';
import { UpdateRoleDto } from '../../roles/dto/update-role.dto';
import { IRoleRepository } from 'src/modules/core/ports/roles.port';

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = this.roleRepository.create(createRoleDto);
    return this.roleRepository.save(role);
  }

  save(role: Role): Promise<Role> {
    return this.roleRepository.save(role);
  }

  findAll(): Promise<Role[]> {
    return this.roleRepository.find();
  }

  findOne(id: number, relations?: string[]): Promise<Role | null> {
    return this.roleRepository.findOne({ where: { id }, relations: relations });
  }

  findOneBy(code: string, relations?: string[]): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { code: code },
      relations: relations,
    });
  }

  async delete(id: number): Promise<void> {
    await this.roleRepository.delete(id);
    return;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role | null> {
    const role = await this.roleRepository.save({
      id,
      ...updateRoleDto,
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  findByCodes(codes: string[]): Promise<Role[]> {
    return this.roleRepository.findBy({
      code: In(codes),
    });
  }
}
