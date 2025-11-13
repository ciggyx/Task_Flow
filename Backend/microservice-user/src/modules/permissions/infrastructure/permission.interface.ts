import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { Permission } from '../entities/permission.entity';
export interface IPermissionRepository {
  create(createPermissionDto: CreatePermissionDto): Promise<Permission>;

  findAll(): Promise<Permission[]>;

  findBy(permissionIds: number[]): Promise<Permission[]>;

  findOne(id: number): Promise<Permission | null>;

  findOneByName(name: string): Promise<Permission | null>;

  update(
    id: number,
    updatedPermissionDto: UpdatePermissionDto,
  ): Promise<Permission | null>;

  delete(id: number): Promise<void>;

  save(permission: Permission): Promise<Permission>;
}
