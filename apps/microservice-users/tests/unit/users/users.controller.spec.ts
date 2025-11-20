import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../../src/modules/users/users.controller';
import { UsersService } from '../../../src/modules/users/users.service';
import { AuthService } from '../../../src/modules/middleware/service.middleware';
import { UpdateUserRoles } from '../../../src/modules/users/dto/update-user-role.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: Partial<UsersService>;
  let authService: Partial<AuthService>;

  beforeEach(async () => {
    // Mockeo de métodos de servicios
    usersService = {
      updateRol: jest.fn().mockResolvedValue('Rol actualizado correctamente'),
      remove: jest.fn().mockResolvedValue('Usuario eliminado correctamente'),
      getIdbyEmail: jest.fn().mockResolvedValue(42),
    };

    authService = {
      validateTokenAndPermissions: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersService },
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateRol', () => {
    it('should call usersService.updateRol with correct parameters', async () => {
      const dto: UpdateUserRoles = { roles: [{ code: 'ADMIN' }] };
      const result = await controller.updateRol('1', dto);
      expect(usersService.updateRol).toHaveBeenCalledWith(1, dto);
      expect(result).toBe('Rol actualizado correctamente');
    });
    it('should throw an error if user not found', async () => {
      (usersService.updateRol as jest.Mock).mockRejectedValueOnce(new Error('User not found'));
      const dto: UpdateUserRoles = { roles: [{ code: 'ADMIN' }] };
      await expect(controller.updateRol('1', dto)).rejects.toThrow('User not found');
    });
    it('should throw an error if role not found', async () => {
      (usersService.updateRol as jest.Mock).mockRejectedValueOnce(new Error('Role not found'));
      const dto: UpdateUserRoles = { roles: [{ code: 'UNKNOWN' }] };
      await expect(controller.updateRol('1', dto)).rejects.toThrow('Role not found');
    });
  });

  describe('remove', () => {
    it('should call usersService.remove with correct id', async () => {
      const result = await controller.remove('5');
      expect(usersService.remove).toHaveBeenCalledWith(5);
      expect(result).toBe('Usuario eliminado correctamente');
    });
    it('should throw an error if user not found', async () => {
      (usersService.remove as jest.Mock).mockRejectedValueOnce(new Error('User not found'));
      await expect(controller.remove('5')).rejects.toThrow('User not found');
    });
  });

  describe('getIdByEmail', () => {
    it('should call usersService.getIdbyEmail with correct email', async () => {
      const email = 'test@example.com';
      const result = await controller.getIdByEmail(email);
      expect(usersService.getIdbyEmail).toHaveBeenCalledWith(email);
      expect(result).toBe(42);
    });
    it('should throw an error if email not found', async () => {
      (usersService.getIdbyEmail as jest.Mock).mockRejectedValueOnce(new Error('Email not found'));
      await expect(controller.getIdByEmail('test@example.com')).rejects.toThrow('Email not found');
    });
  });
});
