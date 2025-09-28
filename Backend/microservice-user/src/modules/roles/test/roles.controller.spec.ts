import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from '../roles.controller';
import { RolesService } from '../roles.service';
import { AuthGuard } from '../../middleware/auth.middleware';
import { mock } from 'node:test';

// Guard mock que siempre permite pasar
class MockAuthGuard {
  canActivate(): boolean {
    return true;
  }
}


describe('RolesController', () => {
  let controller: RolesController;
  let mockRolesService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    mockRolesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    }
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        { provide: RolesService, useValue: mockRolesService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(new MockAuthGuard())
      .compile();

    controller = module.get<RolesController>(RolesController);
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('create', () => {
    it('should call create method of RolesService', async () => {
      const dto = {
        code: 'USER',
        name: 'Usuario',
        description: 'Rol del usuario con permisos mínimos e indispensables',
        permissions: [{ id: 1 }, { id: 2 }, { id: 3 }],
      };
      const createdRole = { id: 1, ...dto };
      mockRolesService.create.mockResolvedValue(createdRole);
      const result = await controller.create(dto);
      expect(result).toEqual(createdRole);
      expect(mockRolesService.create).toHaveBeenCalledWith(dto);
    });
    it('should throw an error if code, name, permissions or description is missing', async () => {
      const dto = { code: '', name: '', description: '', permissions: [] };

      mockRolesService.create.mockRejectedValue(
        new Error('Code, name, permissions and description are required'),
      );

      await expect(controller.create(dto)).rejects.toThrow(
        'Code, name, permissions and description are required',
      );
      expect(mockRolesService.create).toHaveBeenCalledWith(dto);
    });
  });
  describe('findAll', () => {
    it('should call findAll method of RolesService', async () => {
      const roles = [
        { id: 1, code: 'USER', name: 'Usuario', description: 'Rol del usuario con permisos mínimos e indispensables', permissions: [{ id: 1 }, { id: 2 }, { id: 3 }] },
        { id: 2, code: 'ADMIN', name: 'Administrador', description: 'Rol del administrador con todos los permisos', permissions: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }] },
      ];
      mockRolesService.findAll.mockResolvedValue(roles);
      const result = await controller.findAll();
      expect(result).toEqual(roles);
      expect(mockRolesService.findAll).toHaveBeenCalled();
    });
    it('should return an empty array if no roles exist', async () => {
      mockRolesService.findAll.mockResolvedValue([]);
      const result = await controller.findAll();
      expect(result).toEqual([]);
      expect(mockRolesService.findAll).toHaveBeenCalled();
    });
  });
  describe('findOne', () => {
    it('should call findOne method of RolesService', async () => {
      const role = { id: 1, code: 'USER', name: 'Usuario', description: 'Rol del usuario con permisos mínimos e indispensables', permissions: [{ id: 1 }, { id: 2 }, { id: 3 }] };
      mockRolesService.findOne.mockResolvedValue(role);
      const result = await controller.findOne('1');
      expect(result).toEqual(role);
      expect(mockRolesService.findOne).toHaveBeenCalledWith(1);
    });
    it ('should throw an error if role does not exist', async () => {
      mockRolesService.findOne.mockRejectedValue(
        new Error('Role does not exist'),
      );
      await expect(controller.findOne('2')).rejects.toThrow('Role does not exist');
      expect(mockRolesService.findOne).toHaveBeenCalledWith(2);
    });
  });
  describe('update', () => {
    it('should call update method of RolesService', async () => {
      const dto = { name: 'Nuevo nombre' };
      const updatedRole = { id: 1, code: 'USER', name: 'Nuevo nombre', description: 'Rol del usuario con permisos mínimos e indispensables', permissions: [{ id: 1 }, { id: 2 }, { id: 3 }] };
      mockRolesService.update.mockResolvedValue(updatedRole);
      const result = await controller.update(1, dto);
      expect(result).toEqual(updatedRole);
      expect(mockRolesService.update).toHaveBeenCalledWith(1, dto);
    });
    it('should throw an error if role does not exist', async () => {
      const dto = { name: 'Nuevo nombre' };
      mockRolesService.update.mockRejectedValue(
        new Error('Role does not exist'),
      );
      await expect(controller.update(2, dto)).rejects.toThrow('Role does not exist');
      expect(mockRolesService.update).toHaveBeenCalledWith(2, dto);
    });
    it ('should throw an error if no fields are provided for update', async () => {
      const dto = {};
      mockRolesService.update.mockRejectedValue(
        new Error('At least one field (name, description or permissions) must be provided for update'),
      );
      await expect(controller.update(1, dto)).rejects.toThrow('At least one field (name, description or permissions) must be provided for update');
      expect(mockRolesService.update).toHaveBeenCalledWith(1, dto);
    });
    it ('should throw an error if permissions array is empty', async () => {
      const dto = { permissions: [] };
      mockRolesService.update.mockRejectedValue(
        new Error('Permissions array cannot be empty'),
      );
      await expect(controller.update(1, dto)).rejects.toThrow('Permissions array cannot be empty');
      expect(mockRolesService.update).toHaveBeenCalledWith(1, dto);
    });
    it ('should throw an error if permissions array contains invalid ids', async () => {
      const dto = { permissions: [{ id: 999 }] };
      mockRolesService.update.mockRejectedValue(
        new Error('Some permissions do not exist'),
      );
      await expect(controller.update(1, dto)).rejects.toThrow('Some permissions do not exist');
      expect(mockRolesService.update).toHaveBeenCalledWith(1, dto);
    });
    it ('should throw an error if any field is empty or invalid', async () => {
      const dto = { name: '' };
      mockRolesService.update.mockRejectedValue(
        new Error('Fields cannot be empty or invalid'),
      );
      await expect(controller.update(1, dto)).rejects.toThrow('Fields cannot be empty or invalid');
      expect(mockRolesService.update).toHaveBeenCalledWith(1, dto);
    });
  });
  describe('remove', () => {
    it('should call remove method of RolesService', async () => {
      mockRolesService.remove.mockResolvedValue(undefined);
      const result = await controller.remove(1);
      expect(result).toBeUndefined();
      expect(mockRolesService.remove).toHaveBeenCalledWith(1);
    });
    it('should throw an error if role does not exist', async () => {
      mockRolesService.remove.mockRejectedValue(
        new Error('Role does not exist'),
      );
      await expect(controller.remove(2)).rejects.toThrow('Role does not exist');
      expect(mockRolesService.remove).toHaveBeenCalledWith(2);
    });
  });
});