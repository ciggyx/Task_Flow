import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionsService } from '../../permissions.service';
import { Permission } from '../../entities/permission.entity';
import { PermissionRepository } from '../../infrastructure/permission.repository';
import { Role } from '../../../roles/entities/role.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { ConflictException } from '@nestjs/common';

jest.setTimeout(20000);

describe('PermissionsService (integration)', () => {
  let service: PermissionsService;
  let repo: Repository<Permission>;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [Permission, Role, User],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([Permission, Role, User]),
      ],
      providers: [
        PermissionsService,
        // Inyecta la clase real del repository para una integración completa
        PermissionRepository,
      ],
    }).compile();

    service = moduleRef.get<PermissionsService>(PermissionsService);
    repo = moduleRef.get<Repository<Permission>>(
      getRepositoryToken(Permission),
    );
  });

  // Limpia la tabla antes de cada test
  beforeEach(async () => {
    await repo.clear();
  });

  afterAll(async () => {
    if (moduleRef) await moduleRef.close();
  });

  describe('create', () => {
    it('create: crea un permiso válido', async () => {
      const dto = { name: 'read', description: 'Read permission' };
      const created = await service.create(dto as Permission);
      expect(created).toHaveProperty('id');
      expect(created.name).toBe(dto.name);
      expect(created.description).toBe(dto.description);
    });

    it('create: falla si el permiso ya existe', async () => {
      const dto = { name: 'read', description: 'Read permission' };
      await service.create(dto as Permission);
      await expect(service.create(dto as Permission)).rejects.toThrow(
        ConflictException,
      );
    });

    it('create: falla si faltan campos', async () => {
      await expect(
        service.create({ name: '' } as Permission),
      ).rejects.toThrow();
    });
  });

  describe('findAll, findOne', () => {
    it('findAll: devuelve permisos', async () => {
      const dto = { name: 'read', description: 'Read permission' };
      await service.create(dto as Permission);
      const all = await service.findAll();
      expect(Array.isArray(all)).toBe(true);
      expect(all.length).toBeGreaterThanOrEqual(1);
    });

    it('findAll: devuelve vacío si no hay permisos', async () => {
      const all = await service.findAll();
      expect(Array.isArray(all)).toBe(true);
      expect(all.length).toBe(0);
    });

    it('findOne: devuelve el permiso por id', async () => {
      const dto = { name: 'read', description: 'Read permission' };
      const created = await service.create(dto as Permission);
      const found = await service.findOne(created.id);
      expect(found.id).toEqual(created.id);
    });

    it('findOne: falla si no existe', async () => {
      await expect(service.findOne(9999)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('update: modifica el permiso', async () => {
      const dto = { name: 'read', description: 'Read permission' };
      const created = await service.create(dto as Permission);
      await service.update(created.id, {
        name: 'read-upd',
        description: 'desc upd',
      } as Permission);
      const updated = await service.findOne(created.id);
      expect(updated.name).toBe('read-upd');
      expect(updated.description).toBe('desc upd');
    });

    it('update: falla si no existe', async () => {
      await expect(
        service.update(9999, {
          name: 'no-exist',
          description: 'no-exist',
        } as Permission),
      ).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('remove: elimina un permiso', async () => {
      const dto = { name: 'to-delete', description: 'to delete' };
      const p = await service.create(dto as Permission);
      await service.remove(p.id);
      await expect(service.findOne(p.id)).rejects.toThrow();
    });

    it('remove: falla si no existe', async () => {
      await expect(service.remove(9999)).rejects.toThrow();
    });
  });
});
