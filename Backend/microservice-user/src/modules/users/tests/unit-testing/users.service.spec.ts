import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../users.service';
import { UserRepository } from '../../infrastructure/users.repository';
import { RoleRepository } from '../../../roles/infrastructure/roles.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { User } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Role } from '../../../roles/entities/role.entity'; // Asumiendo que existe una entidad Role
import { UpdateUserRoles } from '../../dto/update-user-role.dto';

// Mock de las dependencias
const mockUserRepository = {
  save: jest.fn(),
  findByEmail: jest.fn(),
  findByName: jest.fn(),
  findOneBy: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
};

const mockRoleRepository = {
  findByCodes: jest.fn(),
};

// Mock de la función hash de bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: UserRepository;
  let roleRepo: RoleRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: RoleRepository,
          useValue: mockRoleRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepo = module.get<UserRepository>(UserRepository);
    roleRepo = module.get<RoleRepository>(RoleRepository);

    // Resetear los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // -------------------------------------------------------------------

  describe('saveUser', () => {
    it('should call userRepo.save with the provided user', async () => {
      const user = { email: 'test@example.com' } as User;
      await service.saveUser(user);
      expect(userRepo.save).toHaveBeenCalledWith(user);
    });
    it('should throw an error if userRepo.save fails', async () => {
      const user = { email: 'test@example.com' } as User;
      mockUserRepository.save.mockRejectedValue(new Error('Save failed'));
      await expect(service.saveUser(user)).rejects.toThrow('Save failed');
    });
  });

  // -------------------------------------------------------------------

  describe('findByEmail', () => {
    it('should call userRepo.findByEmail and return the user', async () => {
      const email = 'test@example.com';
      const user = { id: 1, email } as User;
      mockUserRepository.findByEmail.mockResolvedValue(user);

      const result = await service.findByEmail(email, ['roles']);
      expect(userRepo.findByEmail).toHaveBeenCalledWith(email, ['roles']);
      expect(result).toEqual(user);
    });
    it('should return null if user is not found', async () => {
      const email = 'notfound@example.com';
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail(email, ['roles']);
      expect(result).toBeNull();
    });
  });
  // -------------------------------------------------------------------

  describe('getIdbyEmail', () => {
    it('should return the user id if found', async () => {
      const email = 'test@example.com';
      const user = { id: 5, email } as User;
      mockUserRepository.findByEmail.mockResolvedValue(user);

      const result = await service.getIdbyEmail(email);
      expect(result).toBe(5);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const email = 'notfound@example.com';
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(service.getIdbyEmail(email)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getIdbyEmail(email)).rejects.toThrow(
        'No matching user found',
      );
    });
  });
  describe('findByName', () => {
    it('should call userRepo.findByName and return the user', async () => {
      const name = 'testuser';
      const user = { id: 1, name } as User;
      mockUserRepository.findByName.mockResolvedValue(user);

      const result = await service.findByName(name);
      expect(userRepo.findByName).toHaveBeenCalledWith(name, undefined);
      expect(result).toEqual(user);
    });

    it('should return null if user is not found', async () => {
      const name = 'notfounduser';
      mockUserRepository.findByName.mockResolvedValue(null);
      const result = await service.findByName(name);
      expect(result).toBeNull();
    });
  });

  // -------------------------------------------------------------------

  describe('updateRol', () => {
    const userId = 1;
    const updateDto: UpdateUserRoles = {
      roles: [{ code: 'ADMIN' }, { code: 'USER' }],
    };
    const userFound = {
      id: userId,
      email: 'test@user.com',
      name: 'Test Name', // AÑADIDO
      password: 'anypassword', // AÑADIDO
      description: 'Test Description', // AÑADIDO
      roles: [],
    } as User;
    const foundRoles = [
      { id: 1, code: 'ADMIN' } as Role,
      { id: 2, code: 'USER' } as Role,
    ];

    it('should successfully update roles and save the user', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(userFound);
      mockRoleRepository.findByCodes.mockResolvedValue(foundRoles);
      mockUserRepository.save.mockResolvedValue(userFound); // Simular el guardado

      const result = await service.updateRol(userId, updateDto);

      expect(userRepo.findOneBy).toHaveBeenCalledWith(userId);
      expect(roleRepo.findByCodes).toHaveBeenCalledWith(['ADMIN', 'USER']);
      expect(userFound.roles).toEqual(foundRoles);
      expect(userRepo.save).toHaveBeenCalledWith(userFound);
      expect(result).toBe('Role updated successfully');
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.updateRol(userId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(roleRepo.findByCodes).not.toHaveBeenCalled(); // No debe buscar roles
    });

    it('should throw NotFoundException if no matching roles are found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(userFound);
      mockRoleRepository.findByCodes.mockResolvedValue([]); // Roles no encontrados

      await expect(service.updateRol(userId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.updateRol(userId, updateDto)).rejects.toThrow(
        'No matching role found',
      );
      expect(userRepo.save).not.toHaveBeenCalled(); // No debe intentar guardar
    });
  });

  // -------------------------------------------------------------------

  describe('remove', () => {
    it('should call userRepo.delete and return a success message', async () => {
      const userId = 1;
      mockUserRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(userId);
      expect(userRepo.delete).toHaveBeenCalledWith(userId);
      expect(result).toBe('User deleted successfully');
    });
  });

  // -------------------------------------------------------------------

  describe('updatePassword', () => {
    const userId = 1;
    const newPassword = 'newPassword123';
    const hashedPassword = 'hashedPasswordValue';
    const userFound = { id: userId, password: 'oldPassword' } as User;

    beforeAll(() => {
      // Configuramos el mock de bcrypt.hash para que siempre devuelva el valor
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
    });

    it('should hash the new password and update the user', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(userFound);
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      await service.updatePassword(userId, newPassword);

      expect(userRepo.findOneBy).toHaveBeenCalledWith(userId);
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(userRepo.update).toHaveBeenCalledWith(userId, {
        password: hashedPassword,
      });
    });
    it('should throw BadRequestException if password is invalid', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(userFound);

      await expect(service.updatePassword(userId, 'short')).rejects.toThrow(
        BadRequestException,
      );
      expect(bcrypt.hash).not.toHaveBeenCalled(); // No debe intentar hashear
    });
    it('should throw BadRequestException if password is empty', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(userFound);

      await expect(service.updatePassword(userId, '')).rejects.toThrow(
        BadRequestException,
      );
      expect(bcrypt.hash).not.toHaveBeenCalled(); // No debe intentar hashear
    });
    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.updatePassword(userId, newPassword)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.updatePassword(userId, newPassword)).rejects.toThrow(
        'User not found',
      );
      expect(bcrypt.hash).not.toHaveBeenCalled(); // No debe intentar hashear
    });
    it('should throw error if userRepo.update fails', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(userFound);
      mockUserRepository.update.mockRejectedValue(
        new Error('Could not update password'),
      );
      await expect(service.updatePassword(userId, newPassword)).rejects.toThrow(
        'Could not update password',
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
    });
  });
});
