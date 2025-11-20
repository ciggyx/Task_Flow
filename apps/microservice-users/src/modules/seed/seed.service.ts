import { Inject, Injectable } from '@nestjs/common';
import { Role } from '../roles/entities/role.entity';
import { hash } from 'bcrypt';
import { fakerES } from '@faker-js/faker';
import { IPermissionRepository } from '../permissions/infrastructure/permission.interface';
import { IRoleRepository } from '../roles/infrastructure/roles.interface';
import { IUserRepository } from '../users/infrastructure/users.interface';

@Injectable()
export class SeedService {
  constructor(
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,

    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,

    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async run() {
    const permissionData = [
      { id: 1, name: 'createRole', description: 'Crear roles' },
      { id: 2, name: 'getRole', description: 'Visualizar roles' },
      { id: 3, name: 'updateRole', description: 'Actualizar roles' },
      { id: 4, name: 'deleteRole', description: 'Borrar roles' },
      { id: 5, name: 'createPermission', description: 'Crear permisos' },
      { id: 6, name: 'getPermission', description: 'Visualizar permisos' },
      { id: 7, name: 'updatePermission', description: 'Actualizar permisos' },
      { id: 8, name: 'deletePermission', description: 'Borrar permisos' },
      {
        id: 9,
        name: 'assignRole',
        description: 'Asignarle un rol a un usuario',
      },
    ];

    // insert / upsert permisos (evita duplicados por name)
    for (const p of permissionData) {
      const exists = await this.permissionRepository.findOneByName(p.name);
      if (!exists) {
        await this.permissionRepository.create(p);
      }
    }

    const rolesData = [
      {
        id: 1,
        code: 'ADMIN',
        name: 'Administrador',
        description: 'Rol con acceso completo al sistema',
      },
      {
        id: 2,
        code: 'USER',
        name: 'Usuario',
        description: 'Rol del usuario, carece de permisos',
      },
    ];

    for (const r of rolesData) {
      const exists = await this.roleRepository.findOneBy(r.code);
      if (!exists) {
        await this.roleRepository.create(r);
      }
    }

    const adminRole = await this.roleRepository.findOneBy('ADMIN', ['permissions']);

    if (!adminRole) {
      throw new Error('No se encontró el rol ADMIN (esperado luego de crear roles).');
    }

    const idsToAssign = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const permissionsToAssign = await this.permissionRepository.findBy(idsToAssign);

    // asigna (sobrescribe) la lista de permisos del rol ADMIN
    adminRole.permissions = permissionsToAssign;
    await this.roleRepository.save(adminRole);

    const adminEmail = 'admin@sistema.com';
    const adminPasswordHash = await hash('admin123', 10);

    let adminUser = await this.userRepository.findByEmail(adminEmail, ['roles']);

    if (!adminUser) {
      adminUser = await this.userRepository.create({
        name: 'admin',
        email: adminEmail,
        password: adminPasswordHash,
        description: 'Este es el admin',
      });

      adminUser.roles = [adminRole];

      await this.userRepository.save(adminUser);

      const userRole = await this.roleRepository.findOneBy('USER', ['permissions']);

      if (!userRole) {
        throw new Error('No se encontró el rol USER (esperado luego de crear roles).');
      }

      const defaultPassword = await hash('123456', 10);
      const users = Array.from({ length: 39 }).map(() => {
        const name = fakerES.person.fullName();

        return {
          name,
          email: fakerES.internet.email({ firstName: name }),
          password: defaultPassword,
          roles: [userRole],
          description: fakerES.lorem.sentence(),
        };
      });

      await this.userRepository.saveArray(users);
    } else {
      // asegurar que tenga el rol ADMIN
      const hasAdmin = adminUser.roles?.some((r: Role) => r.code === 'ADMIN');
      if (!hasAdmin) {
        adminUser.roles = [...(adminUser.roles || []), adminRole];
        await this.userRepository.save(adminUser);
      }
    }
  }
}
