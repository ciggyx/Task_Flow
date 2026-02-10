import { Inject, Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';
import { fakerES } from '@faker-js/faker';
import { IPermissionRepository } from '../core/ports/permission.port';
import { IRoleRepository } from '../core/ports/roles.port';
import { IUserRepository } from '../core/ports/users.port';
import { IFriendshipRepository } from '../core/ports/friendship.port';
import { FRIENDSHIP_REPO, PERMISSION_REPO, ROLE_REPO, USER_REPO } from '../core/ports/tokens';
import { FriendshipStatus } from '../friendship/entities/friendship.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SeedService {
  constructor(
    @Inject(PERMISSION_REPO)
    private readonly permissionRepository: IPermissionRepository,

    @Inject(ROLE_REPO)
    private readonly roleRepository: IRoleRepository,

    @Inject(USER_REPO)
    private readonly userRepository: IUserRepository,

    @Inject(FRIENDSHIP_REPO)
    private readonly friendshipRepository: IFriendshipRepository,
  ) { }

  async run() {
    //
    // 1. PERMISOS
    //
    const systemPermissions = [
      'role.create',
      'role.read',
      'role.update',
      'role.delete',
      'permission.create',
      'permission.read',
      'permission.update',
      'permission.delete',
      'user.assignRole',
    ];

    const domainPermissions = [
      'dashboard.create',
      'dashboard.read',
      'dashboard.update',
      'dashboard.delete',
      'dashboard.members.read',
      'dashboard.members.update',
      'task.create',
      'task.read',
      'task.update',
      'task.delete',
      'image.read',
      'image.delete'
    ];

    const allPermissions = [...systemPermissions, ...domainPermissions];

    for (const name of allPermissions) {
      const exists = await this.permissionRepository.findOneByName(name);
      if (!exists) {
        await this.permissionRepository.create({
          name,
          description: `Permiso: ${name}`,
        });
      }
    }

    //
    // 2. ROLES
    //
    const roles = [
      { code: 'ADMIN', name: 'Administrador', description: 'Acceso completo' },
      { code: 'USER', name: 'Usuario', description: 'Usuario estándar' },
    ];

    for (const r of roles) {
      const exists = await this.roleRepository.findOneBy(r.code);
      if (!exists) {
        await this.roleRepository.create(r);
      }
    }

    //
    // 3. EXTRAIGO PERMISOS PARA ASIGNAR
    //
    const allPermsEntities = await this.permissionRepository.findAll();
    const domainPermsEntities = allPermsEntities.filter((p) =>
      domainPermissions.includes(p.name),
    );

    const adminRole = await this.roleRepository.findOneBy('ADMIN', ['permissions']);
    const userRole = await this.roleRepository.findOneBy('USER', ['permissions']);

    if (!adminRole || !userRole) {
      throw new Error('Faltan roles ADMIN o USER');
    }

    //
    // 4. ASIGNAR PERMISOS A ROLES
    //
    adminRole.permissions = allPermsEntities;
    await this.roleRepository.save(adminRole);

    userRole.permissions = domainPermsEntities;
    await this.roleRepository.save(userRole);

    //
    // 6. ADMIN USER Y USERS NORMALES
    //
    const adminEmail = 'admin@sistema.com';
    const adminPasswordHash = await hash('admin123', 10);

    let adminUser = await this.userRepository.findByEmail(adminEmail, ['roles']);

    if (!adminUser) {
      adminUser = await this.userRepository.create({
        name: 'admin',
        email: adminEmail,
        password: adminPasswordHash,
        description: 'Admin principal',
      });
      adminUser.roles = [adminRole];
      await this.userRepository.save(adminUser);

      const defaultPassword = await hash('123456', 10);
      const usersData = Array.from({ length: 39 }).map(() => {
        const name = fakerES.person.fullName();
        return {
          name,
          email: fakerES.internet.email({ firstName: name }),
          password: defaultPassword,
          roles: [userRole],
          description: fakerES.lorem.sentence(),
        };
      });

      await this.userRepository.saveArray(usersData);
    } else {
      const hasAdmin = adminUser.roles?.some((r) => r.code === 'ADMIN');
      if (!hasAdmin) {
        adminUser.roles = [...(adminUser.roles || []), adminRole];
        await this.userRepository.save(adminUser);
      }
    }

    //
    // 7. GENERAR AMISTADES ALEATORIAS
    //
    const allUsers = await this.userRepository.findAll();
    const statuses = [FriendshipStatus.PENDING, FriendshipStatus.ACCEPTED, FriendshipStatus.BLOCKED];

    for (const user of allUsers) {
      // Intentar crear entre 1 y 3 relaciones por usuario
      const connectionsCount = fakerES.number.int({ min: 1, max: 3 });
      
      for (let i = 0; i < connectionsCount; i++) {
        const targetUser = allUsers[fakerES.number.int({ min: 0, max: allUsers.length - 1 })];

        // Evitar auto-amistad
        if (user.id === targetUser.id) continue;

        // Evitar duplicados (la base de datos suele tener restricciones unique)
        const existing = await this.friendshipRepository.findByUsers(user.id, targetUser.id);
        if (existing) continue;

        const randomStatus = statuses[fakerES.number.int({ min: 0, max: statuses.length - 1 })];

        await this.friendshipRepository.create({
          requester: { id: user.id } as User,
          addressee: { id: targetUser.id } as User,
          status: randomStatus,
        } as any);
      }
    }
  }
}