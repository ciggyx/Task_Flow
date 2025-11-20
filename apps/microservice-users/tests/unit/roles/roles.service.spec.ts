import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RolesService } from '../../../src/modules/roles/roles.service';
import { RoleRepository } from '../../../src/modules/roles/infrastructure/roles.repository';
import { PermissionRepository } from '../../../src/modules/permissions/infrastructure/permission.repository';
import { CreateRoleDto } from '../../../src/modules/roles/dto/create-role.dto';
import { Role } from '../../../src/modules/roles/entities/role.entity';
import { Permission } from '../../../src/modules/permissions/entities/permission.entity';

describe('RolesService', () => {
  let service: RolesService;
  let mockRolesRepo: {
    create: jest.Mock;
    save: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  let mockPermissionsRepo: {
    findBy: jest.Mock;
  };

  beforeEach(async () => {
    mockRolesRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockPermissionsRepo = {
      findBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: RoleRepository,
          useValue: mockRolesRepo,
        },
        {
          provide: PermissionRepository,
          useValue: mockPermissionsRepo,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a role with permissions', async () => {
      const dto: CreateRoleDto = {
        code: 'ROLE_ADMIN',
        name: 'Administrador',
        description: 'Rol con acceso completo',
        permissions: [{ id: 1 }],
      };
      const permissions: Permission[] = [
        { id: 1, name: 'permiso', description: 'desc', roles: [] },
      ];
      const savedRole: Role = {
        id: 1,
        code: dto.code,
        name: dto.name,
        description: dto.description,
        permissions,
        users: [],
      };

      mockPermissionsRepo.findBy.mockResolvedValue(permissions);
      mockRolesRepo.create.mockReturnValue(savedRole);
      mockRolesRepo.save.mockResolvedValue(savedRole);

      const result = await service.create(dto);
      expect(result).toEqual(savedRole);
      expect(mockPermissionsRepo.findBy).toHaveBeenCalled();
      expect(mockRolesRepo.save).toHaveBeenCalledWith(savedRole);
    });

    it('should throw if permissions not found', async () => {
      const dto: CreateRoleDto = {
        code: 'X',
        name: 'Test',
        description: 'desc',
        permissions: [{ id: 999 }],
      };
      mockPermissionsRepo.findBy.mockResolvedValue([]);
      await expect(service.create(dto)).rejects.toThrow('Some permissions do not exist');
    });

    it('should throw an error if code, name or description is missing', async () => {
      const dto: CreateRoleDto = {
        code: '',
        name: '',
        description: '',
        permissions: [{ id: 1 }],
      };
      await expect(service.create(dto)).rejects.toThrow('Code, name and description are required');
    });
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      const roles: Role[] = [
        {
          id: 1,
          code: 'R1',
          name: 'Rol1',
          description: 'desc',
          permissions: [],
          users: [],
        },
      ];
      mockRolesRepo.findAll.mockResolvedValue(roles);

      const result = await service.findAll();
      expect(result).toEqual(roles);
      expect(mockRolesRepo.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a role if found', async () => {
      const role: Role = {
        id: 1,
        code: 'R1',
        name: 'Rol1',
        description: 'desc',
        permissions: [],
        users: [],
      };
      mockRolesRepo.findOne.mockResolvedValue(role);

      const result = await service.findOne(1);
      expect(result).toEqual(role);
      expect(mockRolesRepo.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if role not found', async () => {
      mockRolesRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a role', async () => {
      const data = { name: 'Nuevo Rol', description: 'desc actualizado' };
      const permissions: Permission[] = [
        { id: 2, name: 'permiso2', description: 'desc2', roles: [] },
      ];
      const existing: Role = {
        id: 1,
        code: 'R1',
        name: 'Old',
        description: 'Old desc',
        permissions: permissions,
        users: [],
      };

      mockRolesRepo.findOne.mockResolvedValue(existing);
      mockRolesRepo.save.mockResolvedValue({ ...existing, ...data }); // lo que devolverá el save

      const result = await service.update(1, data);

      expect(result).toEqual({ ...existing, ...data });
      expect(mockRolesRepo.save).toHaveBeenCalledWith({ ...existing, ...data });
    });

    it('should throw error if code, name, description and permissions are missing', async () => {
      await expect(
        service.update(1, {
          code: '',
          name: '',
          description: '',
          permissions: [],
        }),
      ).rejects.toThrow('Code, name, description or permissions are required');
    });

    it('should throw NotFoundException if role does not exist', async () => {
      mockRolesRepo.findOne.mockResolvedValue(null);
      await expect(service.update(1, { name: 'x', description: 'y' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a role', async () => {
      const role: Role = {
        id: 1,
        code: 'R1',
        name: 'Rol1',
        description: 'desc',
        permissions: [],
        users: [],
      };
      mockRolesRepo.findOne.mockResolvedValue(role);
      mockRolesRepo.delete.mockResolvedValue(undefined);

      await service.remove(1);
      expect(mockRolesRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw error if id is not provided', async () => {
      //@ts-expect-error Se le manda un null cuando recibe un number
      await expect(service.remove(null)).rejects.toThrow('ID is required');
    });

    it('should throw NotFoundException if role does not exist', async () => {
      mockRolesRepo.findOne.mockResolvedValue(null);
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
