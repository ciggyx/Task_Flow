import { DataSource, In } from 'typeorm';
import { Permission } from '../../modules/permissions/entities/permission.entity';
import { Role } from '../../modules/permissions/entities/role.entity';
import { Auth } from '../../modules/users/entities/auth.entity';
import { PERMISSIONS_LIST } from './data/permissions.seeders';
import { ROLE_LIST } from './data/roles.seeders';

export async function seedData(dataSource: DataSource): Promise<void> {
  const permissionRepository = dataSource.getRepository(Permission);
  const roleRepository = dataSource.getRepository(Role);

  const permissionsList = PERMISSIONS_LIST;
  for (const permission of permissionsList) {
    let _permission = permissionRepository.create(
      permission as unknown as Permission,
    );
    await permissionRepository.save(_permission);
  }

  const rolesList = ROLE_LIST;
  for (const role of rolesList) {
    let _permissions = await permissionRepository.findBy({
      id: In(role.permissions),
    });
    let _roleItem = {
      name: role.name,
      guard: role.guard,
      code: role.code,
    };
    let _role = roleRepository.create({
      ..._roleItem,
      permissions: _permissions,
    });
    await roleRepository.save(_role);
  }
}
