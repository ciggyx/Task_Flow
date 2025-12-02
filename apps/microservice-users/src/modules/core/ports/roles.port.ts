import { CreateRoleDto } from 'src/modules/roles/dto/create-role.dto';
import { UpdateRoleDto } from 'src/modules/roles/dto/update-role.dto';
import { Role } from 'src/modules/roles/entities/role.entity';

export interface IRoleRepository {
  create(createRoleDto: CreateRoleDto): Promise<Role>;

  save(role: Role): Promise<Role>;

  findAll(): Promise<Role[]>;

  findOne(id: number, relations?: string[]): Promise<Role | null>;

  findOneBy(code: string, relations?: string[]): Promise<Role | null>;

  delete(id: number): Promise<void>;

  update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role | null>;

  findByCodes(codes: string[]): Promise<Role[]>;
}
