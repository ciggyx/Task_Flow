import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Permission } from '../permissions/entities/permission.entity';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { hash } from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async run() {
    const permissionData: Partial<Permission>[] = [
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
      const exists = await this.permissionRepository.findOne({
        where: { name: p.name },
      });
      if (!exists) {
        await this.permissionRepository.save(
          this.permissionRepository.create(p),
        );
      }
    }

    const rolesData: Partial<Role>[] = [
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
      const exists = await this.roleRepository.findOne({
        where: { code: r.code },
      });
      if (!exists) {
        await this.roleRepository.save(this.roleRepository.create(r));
      }
    }

    const adminRole = await this.roleRepository.findOne({
      where: { code: 'ADMIN' },
      relations: ['permissions'],
    });

    if (!adminRole) {
      throw new Error(
        'No se encontró el rol ADMIN (esperado luego de crear roles).',
      );
    }

    const idsToAssign = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const permissionsToAssign = await this.permissionRepository.find({
      where: { id: In(idsToAssign) },
    });

    // asigna (sobrescribe) la lista de permisos del rol ADMIN
    adminRole.permissions = permissionsToAssign;
    await this.roleRepository.save(adminRole);

    const adminEmail = 'admin@sistema.com';
    const adminPasswordHash = await hash('admin123', 10);

    let adminUser: User | User[] | null = await this.userRepository.findOne({
      where: { email: adminEmail },
      relations: ['roles'],
    });

    if (!adminUser) {
      adminUser = this.userRepository.create({
        name: 'admin',
        email: adminEmail,
        password: adminPasswordHash,
        roles: [adminRole],
        description: 'Este es el admin',
      });

      await this.userRepository.save(adminUser);
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
