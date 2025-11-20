import { Test, TestingModule } from '@nestjs/testing';
import {
  UnauthorizedException,
  NotFoundException,
  HttpException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { Role } from 'src/modules/roles/entities/role.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { LoginUserDto } from 'src/modules/users/dto/login-user.dto';
import { RestorePasswordDto } from 'src/modules/auth/dto/restore-password.dto';
import { Payload } from 'src/modules/jwt/interfaces/payload.interface';
import { Permission } from 'src/modules/permissions/entities/permission.entity';
import { AuthService } from 'src/modules/middleware/service.middleware';
import { UsersService } from 'src/modules/users/users.service';
import { RoleRepository } from 'src/modules/roles/infrastructure/roles.repository';
import { JwtService } from 'src/modules/jwt/jwt.service';
// Mocks de las dependencias
const mockUsersService = {
  saveUser: jest.fn(),
  findByEmail: jest.fn(),
  findByName: jest.fn(),
  findOneByEmailWithRolesAndPermissions: jest.fn(),
  updatePassword: jest.fn(),
};

const mockRoleRepository = {
  findOneBy: jest.fn(),
};

const mockJwtService = {
  generateToken: jest.fn(),
  getPayload: jest.fn(),
};

// Mock de bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compareSync: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let roleRepo: RoleRepository;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: RoleRepository,
          useValue: mockRoleRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    roleRepo = module.get<RoleRepository>(RoleRepository);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // -------------------------------------------------------------------

  describe('register', () => {
    const createUserDto: CreateUserDto = {
      name: 'New User',
      email: 'new@example.com',
      password: 'rawPassword',
      description: 'Test description',
    };
    const hashedPassword = 'hashedPassword123';
    const defaultRole = { id: 1, code: 'USER' } as Role;

    beforeEach(() => {
      // Simular hash de bcrypt
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      // Simular encontrar el rol por defecto
      mockRoleRepository.findOneBy.mockResolvedValue(defaultRole);
      // Simular guardado exitoso
      mockUsersService.saveUser.mockResolvedValue(undefined);
    });

    it('should successfully register a user with default role', async () => {
      const result = await service.register(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(roleRepo.findOneBy).toHaveBeenCalledWith('USER');

      expect(usersService.saveUser).toHaveBeenCalledTimes(1);
      const userArg: User = mockUsersService.saveUser.mock.calls[0][0];

      expect(userArg.password).toBe(hashedPassword);
      expect(userArg.roles).toEqual([defaultRole]);
      expect(result).toEqual({ status: 'User successfully created' });
    });

    it('should throw NotFoundException if default role is not found', async () => {
      mockRoleRepository.findOneBy.mockResolvedValue(null);

      await expect(service.register(createUserDto)).rejects.toThrow(NotFoundException);
      await expect(service.register(createUserDto)).rejects.toThrow('Default Role not found');
    });

    it('should throw HttpException on database save error', async () => {
      mockUsersService.saveUser.mockRejectedValue(new Error('DB Error'));

      await expect(service.register(createUserDto)).rejects.toThrow(HttpException);
      await expect(service.register(createUserDto)).rejects.toThrow(
        'Internal server error during registration.',
      );
    });
    it('should throw ConflictException on duplicate email/username error', async () => {
      const duplicateError = new Error('Duplicate entry');
      (duplicateError as any).code = '23505';
      mockUsersService.saveUser.mockRejectedValue(duplicateError);
      await expect(service.register(createUserDto)).rejects.toThrow(ConflictException);
      await expect(service.register(createUserDto)).rejects.toThrow(
        'Email or Username already registered.',
      );
    });
  });

  // ------------------------------------------------------------------

  describe('login', () => {
    const loginUserDto: LoginUserDto = {
      identifierName: 'testuser',
      password: 'rawPassword',
    };
    const existingUser: User = {
      id: 1,
      name: 'testuser',
      email: 'test@example.com',
      password: 'hashedPassword',
      description: 'A user',
      roles: [{ id: 10, code: 'USER' }] as Role[],
    };
    const mockTokens = {
      accessToken: 'mock_access',
      refreshToken: 'mock_refresh',
    };

    beforeEach(() => {
      mockJwtService.generateToken.mockReturnValueOnce(mockTokens.accessToken);
      mockJwtService.generateToken.mockReturnValueOnce(mockTokens.refreshToken);
    });

    it('should log in successfully by email', async () => {
      // Simular búsqueda por email exitosa
      mockUsersService.findByEmail.mockResolvedValue(existingUser);
      mockUsersService.findByName.mockResolvedValue(null); // No debería buscar por nombre
      (bcrypt.compareSync as jest.Mock).mockReturnValue(true);

      const result = await service.login(loginUserDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(loginUserDto.identifierName, ['roles']);
      expect(usersService.findByName).not.toHaveBeenCalled();
      expect(bcrypt.compareSync).toHaveBeenCalledWith(loginUserDto.password, existingUser.password);
      expect(jwtService.generateToken).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockTokens);
    });

    it('should fall back and log in successfully by name if email fails', async () => {
      const loginDtoByName: LoginUserDto = {
        identifierName: 'Test Name',
        password: 'rawPassword',
      };
      // Simular email no encontrado, pero nombre encontrado
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.findByName.mockResolvedValue(existingUser);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(true);

      const result = await service.login(loginDtoByName);

      expect(usersService.findByEmail).toHaveBeenCalled();
      expect(usersService.findByName).toHaveBeenCalledWith(loginDtoByName.identifierName, [
        'roles',
      ]);
      expect(result).toEqual(mockTokens);
    });

    it('should throw UnauthorizedException if user is not found by email or name', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.findByName.mockResolvedValue(null);

      await expect(service.login(loginUserDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginUserDto)).rejects.toThrow('User or password wrong.');
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockUsersService.findByEmail.mockResolvedValue(existingUser);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(false); // Contraseña incorrecta

      await expect(service.login(loginUserDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginUserDto)).rejects.toThrow('User or password wrong');
    });
    it('should throw UnauthorizedException if the password is missing', async () => {
      const loginDtoWithoutPassword: LoginUserDto = {
        identifierName: 'Test User',
        password: '',
      };

      await expect(service.login(loginDtoWithoutPassword)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDtoWithoutPassword)).rejects.toThrow(
        'User or password wrong',
      );
    });
    it('should throw UnauthorizedException if user is null', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.findByName.mockResolvedValue(null);

      await expect(service.login(loginUserDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginUserDto)).rejects.toThrow('User or password wrong');
    });
    it('should throw UnauthorizedException if user has no roles', async () => {
      const userWithoutRoles = { ...existingUser, roles: [] } as User;
      mockUsersService.findByEmail.mockResolvedValue(userWithoutRoles);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(true);

      await expect(service.login(loginUserDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginUserDto)).rejects.toThrow(
        'The user does not have a role assigned.',
      );
    });
  });

  // -------------------------------------------------------------------

  describe('forgotPassword', () => {
    const email = 'test@example.com';

    it('should throw BadRequestException if user is not found', async () => {
      mockUsersService.findOneByEmailWithRolesAndPermissions.mockResolvedValue(null);

      await expect(service.forgotPassword(email)).rejects.toThrow(BadRequestException);
      await expect(service.forgotPassword(email)).rejects.toThrow('Email not found');
    });
  });

  // -------------------------------------------------------------------

  describe('restorePassword', () => {
    const restoreDto: RestorePasswordDto = {
      email: 'test@example.com',
      password: 'newPassword',
    };
    const existingUser = { id: 1, email: restoreDto.email } as User;

    beforeEach(() => {
      mockUsersService.updatePassword.mockResolvedValue(undefined);
    });

    it('should successfully update the user password', async () => {
      mockUsersService.findOneByEmailWithRolesAndPermissions.mockResolvedValue(existingUser);

      const result = await service.restorePassword(restoreDto);

      expect(usersService.findOneByEmailWithRolesAndPermissions).toHaveBeenCalledWith(
        restoreDto.email,
      );
      expect(usersService.updatePassword).toHaveBeenCalledWith(
        existingUser.id,
        restoreDto.password,
      );
      expect(result).toEqual({ message: 'Password updated successfully' });
    });

    it('should throw BadRequestException if user is not found', async () => {
      mockUsersService.findOneByEmailWithRolesAndPermissions.mockResolvedValue(null);

      await expect(service.restorePassword(restoreDto)).rejects.toThrow(BadRequestException);
      await expect(service.restorePassword(restoreDto)).rejects.toThrow('Email not found');
      expect(usersService.updatePassword).not.toHaveBeenCalled();
    });
    it('should throw an error if updatePassword fails', async () => {
      mockUsersService.findOneByEmailWithRolesAndPermissions.mockResolvedValue(existingUser);
      mockUsersService.updatePassword.mockRejectedValue(new Error('Update failed'));
      await expect(service.restorePassword(restoreDto)).rejects.toThrow('Update failed');
      expect(usersService.updatePassword).toHaveBeenCalledWith(
        existingUser.id,
        restoreDto.password,
      );
    });
  });

  // -------------------------------------------------------------------

  describe('validateTokenAndPermissions', () => {
    const authHeader = 'Bearer token-jwt-mock';
    const requiredPermissions = ['user:read', 'data:read'];
    const mockPayload: Payload = {
      email: 'test@example.com',
      sub: '1',
      rolesId: [1],
      rolesCode: ['ADMIN'],
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
    };
    const mockUser: User = {
      id: 1,
      email: 'test@example.com',
      password: 'hash',
      name: 'Test',
      description: 'D',
      roles: [
        {
          id: 1,
          code: 'ADMIN',
          permissions: [
            { id: 10, name: 'user:read' } as Permission,
            { id: 11, name: 'data:read' } as Permission,
            { id: 12, name: 'admin:write' } as Permission,
          ],
        } as Role,
      ],
    };

    beforeEach(() => {
      mockJwtService.getPayload.mockReturnValue(mockPayload);
      mockUsersService.findOneByEmailWithRolesAndPermissions.mockResolvedValue(mockUser);
    });

    it('should return true if token is valid and user has all required permissions', async () => {
      const result = await service.validateTokenAndPermissions(authHeader, requiredPermissions);

      expect(jwtService.getPayload).toHaveBeenCalledWith('token-jwt-mock', 'JWT_AUTH');
      expect(usersService.findOneByEmailWithRolesAndPermissions).toHaveBeenCalledWith(
        mockPayload.email,
      );
      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException if token is not provided or malformed', async () => {
      await expect(
        service.validateTokenAndPermissions('InvalidToken', requiredPermissions),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token verification fails', async () => {
      mockJwtService.getPayload.mockImplementation(() => {
        throw new Error('JWT verification failed');
      });

      await expect(
        service.validateTokenAndPermissions(authHeader, requiredPermissions),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.validateTokenAndPermissions(authHeader, requiredPermissions),
      ).rejects.toThrow('Token inválido o expirado.');
    });

    it('should throw ForbiddenException if user lacks required permissions', async () => {
      const insufficientPermissions = ['user:read', 'admin:delete'];

      await expect(
        service.validateTokenAndPermissions(authHeader, insufficientPermissions),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.validateTokenAndPermissions(authHeader, insufficientPermissions),
      ).rejects.toThrow('No tienes los permisos requeridos.');
    });
    it('should throw UnauthorizedException if user is not found', async () => {
      mockUsersService.findOneByEmailWithRolesAndPermissions.mockResolvedValue(null);
      await expect(
        service.validateTokenAndPermissions(authHeader, requiredPermissions),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.validateTokenAndPermissions(authHeader, requiredPermissions),
      ).rejects.toThrow('Usuario no encontrado.');
    });
  });
});
