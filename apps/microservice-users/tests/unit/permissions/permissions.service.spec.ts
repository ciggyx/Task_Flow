import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CreatePermissionDto } from 'src/modules/permissions/dto/create-permission.dto';
import { Permission } from 'src/modules/permissions/entities/permission.entity';
import { PermissionsService } from 'src/modules/permissions/permissions.service';
import { PermissionRepository } from 'src/modules/permissions/infrastructure/permission.repository';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let mockRepo: {
    create: jest.Mock;
    save: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        {
          provide: PermissionRepository,
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a permission', async () => {
      const dto: CreatePermissionDto = {
        name: 'verTareas',
        description: 'desc',
      };
      const savedPermission: Permission = { id: 1, ...dto, roles: [] }; // Add roles

      mockRepo.create.mockReturnValue(dto);
      mockRepo.save.mockResolvedValue(savedPermission);

      const result = await service.create(dto);
      expect(result).toEqual(savedPermission);
      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(mockRepo.save).toHaveBeenCalledWith(dto);
    });

    it('should throw an error if name or description is missing', async () => {
      const dto: CreatePermissionDto = { name: '', description: '' };
      await expect(service.create(dto)).rejects.toThrow('Name and description are required');
    });
  });

  describe('findAll', () => {
    it('should return all permissions', async () => {
      const permissions: Permission[] = [
        { id: 1, name: 'verTareas', description: 'desc', roles: [] }, // Add roles
      ];
      mockRepo.findAll.mockResolvedValue(permissions);

      const result = await service.findAll();
      expect(result).toEqual(permissions);
      expect(mockRepo.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a permission if found', async () => {
      const perm: Permission = {
        id: 1,
        name: 'verTareas',
        description: 'desc',
        roles: [],
      }; // Add roles
      mockRepo.findOne.mockResolvedValue(perm);

      const result = await service.findOne(1);
      expect(result).toEqual(perm);
      expect(mockRepo.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if permission not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a permission', async () => {
      const data = { name: 'updated', description: 'updated desc' };
      const updatedPermission: Permission = { id: 1, ...data, roles: [] }; // Add roles
      mockRepo.findOne.mockResolvedValue(updatedPermission);
      mockRepo.update.mockResolvedValue(undefined);

      await service.update(1, data);
      expect(mockRepo.update).toHaveBeenCalledWith(1, data);
    });

    it('should throw error if name or description is missing', async () => {
      await expect(service.update(1, { name: '', description: '' })).rejects.toThrow(
        'Name and description are required',
      );
    });

    it('should throw NotFoundException if permission does not exist', async () => {
      const data = { name: 'x', description: 'y' };
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.update(1, data)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a permission', async () => {
      const permission: Permission = {
        id: 1,
        name: 'x',
        description: 'y',
        roles: [],
      }; // Add roles
      mockRepo.findOne.mockResolvedValue(permission);
      mockRepo.delete.mockResolvedValue(undefined);

      await service.remove(1);
      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw error if id is not provided', async () => {
      //@ts-expect-error Se le manda un null cuando recibe un number
      await expect(service.remove(null)).rejects.toThrow('ID is required');
    });

    it('should throw NotFoundException if permission does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
