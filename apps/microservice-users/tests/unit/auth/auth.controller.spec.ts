import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../../src/modules/auth/auth.controller';
import { AuthService } from '../../../src/modules/auth/auth.service';
import { CreateUserDto } from '../../../src/modules/users/dto/create-user.dto';
import { LoginUserDto } from '../../../src/modules/users/dto/login-user.dto';
import { RestorePasswordDto } from '../../../src/modules/auth/dto/restore-password.dto';

// Mock del AuthService, el único proveedor que inyectamos
const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  forgotPassword: jest.fn(),
  restorePassword: jest.fn(),
  validateTokenAndPermissions: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService, // Provee el mock
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);

    // Limpiar los mocks antes de cada test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // -------------------------------------------------------------------

  describe('register', () => {
    it('should call authService.register with the DTO', async () => {
      const createUserDto: CreateUserDto = {
        name: 'TestUser',
        email: 'test@example.com',
        password: 'password123',
        description: 'A test user',
      };

      // Simular la respuesta del servicio (podría ser un token o el usuario creado)
      mockAuthService.register.mockResolvedValue({
        id: 1,
        email: createUserDto.email,
      });

      const result = await controller.register({ createUserDto });

      expect(service.register).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual({ id: 1, email: createUserDto.email });
    });
    it('should handle errors thrown by authService.register', async () => {
      const createUserDto: CreateUserDto = {
        name: 'TestUser',
        email: 'test@example.com',
        password: 'password123',
        description: 'A test user',
      };

      mockAuthService.register.mockRejectedValue(new Error('Registration failed'));

      await expect(controller.register({ createUserDto })).rejects.toThrow('Registration failed');
    });
  });

  // -------------------------------------------------------------------

  describe('login', () => {
    it('should call authService.login with the DTO and return the token', async () => {
      const loginUserDto: LoginUserDto = {
        identifierName: 'test@example.com',
        password: 'password123',
      };
      const token = { accessToken: 'mocked-jwt-token' };

      // Simular el login exitoso
      mockAuthService.login.mockResolvedValue(token);

      const result = await controller.login({ loginUserDto });

      expect(service.login).toHaveBeenCalledWith(loginUserDto);
      expect(result).toEqual(token);
    });
    it('should handle errors thrown by authService.login', async () => {
      const loginUserDto: LoginUserDto = {
        identifierName: 'test@example.com',
        password: 'password123',
      };

      mockAuthService.login.mockRejectedValue(new Error('Login failed'));

      await expect(controller.login({ loginUserDto })).rejects.toThrow('Login failed');
    });
  });

  // -------------------------------------------------------------------

  describe('forgotPassword', () => {
    it('should call authService.forgotPassword with the provided email', async () => {
      const email = 'user@example.com';
      const serviceResponse = 'Password recovery email sent';

      mockAuthService.forgotPassword.mockResolvedValue(serviceResponse);

      const result = await controller.forgotPassword(email);

      expect(service.forgotPassword).toHaveBeenCalledWith(email);
      expect(result).toEqual(serviceResponse);
    });
    it('should handle errors thrown by authService.forgotPassword', async () => {
      const email = 'user@example.com';

      mockAuthService.forgotPassword.mockRejectedValue(new Error('Forgot password failed'));

      await expect(controller.forgotPassword(email)).rejects.toThrow('Forgot password failed');
    });
  });

  // -------------------------------------------------------------------

  describe('restorePassword', () => {
    it('should call authService.restorePassword with the DTO', async () => {
      const restoreDto: RestorePasswordDto = {
        email: 'user@example.com',
        password: 'newSecurePassword',
      };
      const serviceResponse = 'Password restored successfully';

      mockAuthService.restorePassword.mockResolvedValue(serviceResponse);

      const result = await controller.restorePassword(restoreDto);

      expect(service.restorePassword).toHaveBeenCalledWith(restoreDto);
      expect(result).toEqual(serviceResponse);
    });
    it('should handle errors thrown by authService.restorePassword', async () => {
      const restoreDto: RestorePasswordDto = {
        email: 'user@example.com',
        password: 'newSecurePassword',
      };

      mockAuthService.restorePassword.mockRejectedValue(new Error('Restore failed'));

      await expect(controller.restorePassword(restoreDto)).rejects.toThrow('Restore failed');
    });
  });

  // -------------------------------------------------------------------

  describe('validatePermission', () => {
    it('should call authService.validateTokenAndPermissions and return true', async () => {
      const authHeader = 'Bearer mocked-jwt-token';
      const requiredPermissions = ['user:read', 'admin:write'];

      mockAuthService.validateTokenAndPermissions.mockResolvedValue(true);

      const result = await controller.validatePermission(authHeader, requiredPermissions);

      expect(service.validateTokenAndPermissions).toHaveBeenCalledWith(
        authHeader,
        requiredPermissions,
      );
      expect(result).toBe(true);
    });

    it('should call authService.validateTokenAndPermissions and return false', async () => {
      const authHeader = 'Bearer mocked-jwt-token';
      const requiredPermissions = ['super:secret'];

      mockAuthService.validateTokenAndPermissions.mockResolvedValue(false);

      const result = await controller.validatePermission(authHeader, requiredPermissions);

      expect(result).toBe(false);
    });
  });
});
