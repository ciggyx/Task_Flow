import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsController } from '@microservice-users/modules/permissions/permissions.controller';
import { PermissionsService } from '../permissions.service';
import { NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@microservice-users/modules/middleware/auth.guard';

// Guard mock que siempre permite pasar
class MockAuthGuard {
  canActivate(): boolean {
    return true;
  }
}

describe('PermissionsController', () => {
  let controller: PermissionsController;
  let mockPermissionService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    mockPermissionService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [{ provide: PermissionsService, useValue: mockPermissionService }],
    })
      .overrideGuard(AuthGuard)
      .useValue(new MockAuthGuard())
      .compile();

    controller = module.get<PermissionsController>(PermissionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call create method of PermissionsService', async () => {
      const dto = {
        name: 'verTareas',
        description: 'Permiso que permite al usuario ver todas sus tareas',
      };

      const createdPermission = { id: 1, ...dto };
      mockPermissionService.create.mockResolvedValue(createdPermission);

      const result = await controller.create(dto);

      expect(result).toEqual(createdPermission);
      expect(mockPermissionService.create).toHaveBeenCalledWith(dto);
    });

    it('should throw an error if name or description is missing', async () => {
      const dto = { name: '', description: '' };

      mockPermissionService.create.mockRejectedValue(
        new Error('Name and description are required'),
      );

      await expect(controller.create(dto)).rejects.toThrow('Name and description are required');
      expect(mockPermissionService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('find', () => {
    it('should call findAll method of PermissionsService', async () => {
      const permissions = [{ id: 1, name: 'verTareas', description: 'desc' }];
      mockPermissionService.findAll.mockResolvedValue(permissions);

      const result = await controller.findAll();

      expect(result).toEqual(permissions);
      expect(mockPermissionService.findAll).toHaveBeenCalled();
    });

    it('should call findOne method of PermissionsService', async () => {
      const permission = { id: 1, name: 'verTareas', description: 'desc' };
      mockPermissionService.findOne.mockResolvedValue(permission);

      const result = await controller.findOne('1');

      expect(result).toEqual(permission);
      expect(mockPermissionService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('not found errors', () => {
    it('should throw an error if permission is not found in findOne', async () => {
      mockPermissionService.findOne.mockRejectedValue(
        new NotFoundException('Permission not found'),
      );

      await expect(controller.findOne('1')).rejects.toThrow('Permission not found');
    });

    it('should throw an error if permission is not found in remove', async () => {
      mockPermissionService.remove.mockRejectedValue(new NotFoundException('Permission not found'));

      await expect(controller.remove('1')).rejects.toThrow('Permission not found');
    });
  });

  describe('update and remove empty errors', () => {
    it('should throw an error if the field is empty in update', async () => {
      const updateDto = { description: '' };
      mockPermissionService.update.mockRejectedValue(new Error('Description is required'));

      await expect(controller.update('1', updateDto)).rejects.toThrow('Description is required');
    });

    it('should throw an error if the field is empty on remove', async () => {
      mockPermissionService.remove.mockRejectedValue(new Error('Id is required'));

      await expect(controller.remove('1')).rejects.toThrow('Id is required');
    });
  });

  describe('update', () => {
    it('should call update method of PermissionsService', async () => {
      const updateDto = { description: 'desc actualizada' };
      const updatedPermission = { id: 1, name: 'verTareas', ...updateDto };
      mockPermissionService.update.mockResolvedValue(updatedPermission);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(updatedPermission);
      expect(mockPermissionService.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should call remove method of PermissionsService', async () => {
      mockPermissionService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(result).toBeUndefined();
      expect(mockPermissionService.remove).toHaveBeenCalledWith(1);
    });
  });
});
