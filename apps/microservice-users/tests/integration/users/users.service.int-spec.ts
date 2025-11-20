import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { compare } from 'bcrypt';
import { UsersService } from 'src/modules/users/users.service';
import { User } from 'src/modules/users/entities/user.entity';
import { Role } from 'src/modules/roles/entities/role.entity';
import { Permission } from 'src/modules/permissions/entities/permission.entity';
import { UserRepository } from 'src/modules/users/infrastructure/users.repository';
import { RoleRepository } from 'src/modules/roles/infrastructure/roles.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateUserRoles } from 'src/modules/users/dto/update-user-role.dto';

jest.setTimeout(20000);

describe('UsersService (integration)', () => {
  let service: UsersService;
  let userRepo: Repository<User>;
  let roleRepo: Repository<Role>;
  let permissionRepo: Repository<Permission>;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [User, Role, Permission],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([User, Role, Permission]),
      ],
      providers: [UsersService, UserRepository, RoleRepository],
    }).compile();

    service = moduleRef.get<UsersService>(UsersService);
    userRepo = moduleRef.get<Repository<User>>(getRepositoryToken(User));
    roleRepo = moduleRef.get<Repository<Role>>(getRepositoryToken(Role));
    permissionRepo = moduleRef.get<Repository<Permission>>(getRepositoryToken(Permission));
  });

  beforeEach(async () => {
    // Desactivar constraints
    await userRepo.query('PRAGMA foreign_keys = OFF;');
    await permissionRepo.query('PRAGMA foreign_keys = OFF;');
    await roleRepo.query('PRAGMA foreign_keys = OFF;');

    await userRepo.clear();
    await roleRepo.clear();
    await permissionRepo.clear();

    // Volver a activarlas
    await userRepo.query('PRAGMA foreign_keys = ON;');
    await permissionRepo.query('PRAGMA foreign_keys = ON;');
    await roleRepo.query('PRAGMA foreign_keys = ON;');
  });

  afterAll(async () => {
    if (moduleRef) await moduleRef.close();
  });

  // ---------- saveUser ----------
  describe('saveUser', () => {
    it('guarda un usuario correctamente', async () => {
      const user = userRepo.create({
        name: 'Alice',
        email: 'alice@test.com',
        password: '12345678',
        description: 'test',
      });
      await service.saveUser(user);
      const found = await userRepo.findOne({
        where: { email: 'alice@test.com' },
      });
      expect(found).toBeDefined();
      expect(found!.name).toBe('Alice');
    });

    it('lanza error si email duplicado', async () => {
      const user = userRepo.create({
        name: 'Alice',
        email: 'alice@test.com',
        password: '12345678',
        description: 'test',
      });
      await service.saveUser(user);
      await expect(service.saveUser(user)).rejects.toThrow();
    });

    it('lanza error si password es vacía', async () => {
      const user = userRepo.create({
        name: 'Bob',
        email: 'bob@test.com',
        password: '',
        description: 'x',
      });
      await expect(service.saveUser(user)).rejects.toThrow();
    });
    it('lanza error si password es menor a 8 caracteres', async () => {
      const user = userRepo.create({
        name: 'Bob',
        email: 'bob@test.com',
        password: '1234567',
        description: 'x',
      });
      await expect(service.saveUser(user)).rejects.toThrow();
    });
  });

  // ---------- getIdbyEmail ----------
  describe('getIdbyEmail', () => {
    it('devuelve id si existe', async () => {
      const u = await userRepo.save({
        name: 'Bob',
        email: 'bob@test.com',
        password: 'abcd1234',
        description: 'x',
      });
      const id = await service.getIdbyEmail('bob@test.com');
      expect(id).toBe(u.id);
    });

    it('lanza NotFound si no existe', async () => {
      await expect(service.getIdbyEmail('nope@test.com')).rejects.toThrow(NotFoundException);
    });
  });

  // ---------- findByEmail / findByName ----------
  describe('findByEmail', () => {
    it('recupera usuario con roles y permisos', async () => {
      const perm = await permissionRepo.save({
        name: 'p1',
        description: 'p1',
      } as Permission);

      const role = await roleRepo.save({
        code: 'R1',
        name: 'Role1',
        description: 'Role1',
        permissions: [perm],
      } as Role);

      const _u = await userRepo.save({
        name: 'Carl',
        email: 'carl@test.com',
        password: 'pwd12345',
        description: 'x',
        roles: [role],
      } as User);

      const found = await service.findByEmail('carl@test.com', ['roles', 'roles.permissions']);
      expect(found).toBeDefined();
      expect(found!.roles).toHaveLength(1);
      expect(found!.roles[0].permissions).toHaveLength(1);
    });

    it('devuelve null si no existe', async () => {
      const found = await service.findByEmail('noone@test.com');
      expect(found).toBeNull();
    });
  });

  describe('findByName', () => {
    it('recupera usuario por nombre', async () => {
      const _u = await userRepo.save({
        name: 'Carl',
        email: 'carl@test.com',
        password: 'pwd12345',
        description: 'x',
      } as User);

      const found = await service.findByName('Carl');
      expect(found).toBeDefined();
      expect(found!.name).toBe('Carl');
    });

    it('devuelve null si no existe', async () => {
      const found = await service.findByName('noone');
      expect(found).toBeNull();
    });
  });

  // ---------- updateRol ----------
  describe('updateRol', () => {
    it('asigna roles correctamente', async () => {
      const _role = await roleRepo.save({
        code: 'ADMIN',
        name: 'Admin',
        description: 'Admin',
      } as Role);
      const user = await userRepo.save({
        name: 'D',
        email: 'd@test.com',
        password: 'pass1234',
        description: 'x',
      } as User);

      const result = await service.updateRol(user.id, {
        roles: [{ code: 'ADMIN' }],
      } as UpdateUserRoles);
      expect(result).toBe('Role updated successfully');

      const updated = await userRepo.findOne({
        where: { id: user.id },
        relations: ['roles'],
      });
      expect(updated!.roles).toHaveLength(1);
      expect(updated!.roles[0].code).toBe('ADMIN');
    });

    it('lanza NotFound si usuario no existe', async () => {
      await expect(
        service.updateRol(9999, {
          roles: [{ code: 'ADMIN' }],
        } as UpdateUserRoles),
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza NotFound si rol no existe', async () => {
      const user = await userRepo.save({
        name: 'E',
        email: 'e@test.com',
        password: 'pass1234',
        description: 'x',
      } as User);
      await expect(
        service.updateRol(user.id, {
          roles: [{ code: 'NOPE' }],
        } as UpdateUserRoles),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ---------- findOneByEmailWithRolesAndPermissions ----------
  describe('findOneByEmailWithRolesAndPermissions', () => {
    it('devuelve usuario con roles y permisos', async () => {
      const perm = await permissionRepo.save({
        name: 'p2',
        description: 'p2',
      } as Permission);
      const role = await roleRepo.save({
        code: 'R2',
        name: 'Role2',
        description: 'Role2',
        permissions: [perm],
      } as Role);
      const _u = await userRepo.save({
        name: 'F',
        email: 'f@test.com',
        password: 'pwd',
        description: 'x',
        roles: [role],
      } as User);

      const found = await service.findOneByEmailWithRolesAndPermissions('f@test.com');
      expect(found).toBeDefined();
      expect(found.roles).toHaveLength(1);
      expect(found.roles[0].permissions).toHaveLength(1);
    });

    it('lanza NotFoundException si no existe', async () => {
      await expect(service.findOneByEmailWithRolesAndPermissions('noone@test.com')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ---------- updatePassword ----------
  describe('updatePassword', () => {
    it('actualiza contraseña correctamente', async () => {
      const u = await userRepo.save({
        name: 'G',
        email: 'g@test.com',
        password: 'oldpass',
        description: 'x',
      } as User);
      await service.updatePassword(u.id, 'newpassword');
      const updated = await userRepo.findOne({ where: { id: u.id } });
      const match = await compare('newpassword', updated!.password);
      expect(match).toBe(true);
    });

    it('lanza BadRequestException si la nueva contraseña es inválida', async () => {
      const u = await userRepo.save({
        name: 'H',
        email: 'h@test.com',
        password: 'oldpass',
        description: 'x',
      } as User);
      await expect(service.updatePassword(u.id, '')).rejects.toThrow(BadRequestException);
      await expect(service.updatePassword(u.id, '123')).rejects.toThrow(BadRequestException);
    });

    it('lanza NotFoundException si el usuario no existe', async () => {
      await expect(service.updatePassword(9999, 'anotherpass')).rejects.toThrow(NotFoundException);
    });
  });

  // ---------- remove ----------
  describe('remove', () => {
    it('elimina usuario correctamente', async () => {
      const u = await userRepo.save({
        name: 'ToDelete',
        email: 'todelete@test.com',
        password: 'pwd',
        description: 'x',
      } as User);
      const res = await service.remove(u.id);
      expect(res).toContain('User deleted successfully');

      const found = await userRepo.findOne({ where: { id: u.id } });
      expect(found).toBeNull();
    });

    it('lanza NotFoundException si usuario no existe', async () => {
      await expect(service.remove(9999)).rejects.toThrow(NotFoundException);
    });
  });
});
