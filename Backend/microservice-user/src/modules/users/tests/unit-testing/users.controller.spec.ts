import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../users.controller';
import { UsersService } from '../../users.service';

describe('UsersController', () => {
  let controller: UsersController;
  const mockUsersService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should call register method of UsersService', async () => {
    const dto = {
      name: 'testuser',
      email: 'testuser@example.com',
      password: 'password123',
      description: 'A test user',
    };
    mockUsersService.register.mockResolvedValue({ status: 'User successfully created' });
    const result = await controller.register(dto);
    expect(result).toEqual({ status: 'User successfully created' });
    expect(mockUsersService.register).toHaveBeenCalledWith(dto);
  });
});
