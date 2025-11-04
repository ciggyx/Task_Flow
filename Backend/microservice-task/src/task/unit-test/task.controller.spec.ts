import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from '../task.controller';
import { TaskService } from '../task.service';
import { TaskResponseDto } from '../dto/response-task.dto';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';

describe('TaskController', () => {
  let controller: TaskController;
  let service: TaskService;

  // ✅ Factory para crear mocks coherentes con TaskResponseDto
  const mockTaskFactory = () => ({
    id: 1,
    title: 'Test Task',
    description: 'This is a test task',
    status: { id: 1, name: 'Pending' },
    priority: { id: 2, name: 'High' },
    dashboard: { id: 3, name: 'Main Dashboard' },
  });

  // ✅ Mock del servicio
  const mockTaskService = {
    create: jest.fn().mockResolvedValue(mockTaskFactory()),
    findAll: jest.fn().mockResolvedValue([mockTaskFactory()]),
    findOne: jest.fn().mockResolvedValue(mockTaskFactory()),
    update: jest.fn().mockResolvedValue({ ...mockTaskFactory(), title: 'Updated Task' }),
    remove: jest.fn().mockResolvedValue({ deleted: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: mockTaskService,
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    service = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const dto: CreateTaskDto = {
        name: 'New Task',
        description: 'Desc',
        endDate: new Date('2025-08-30T18:00:00.000Z'),
        statusId: 1,
        priorityId: 1,
        dashboardId: 1,
      };

      const result = await controller.create(dto);

      expect(result).toEqual(mockTaskFactory());
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return an array of TaskResponseDto', async () => {
      const result = await controller.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(TaskResponseDto);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single TaskResponseDto', async () => {
      const mockTask = mockTaskFactory();

      const result = await controller.findOne(mockTask.id.toString());

      expect(result).toBeInstanceOf(TaskResponseDto);
      expect(service.findOne).toHaveBeenCalledWith(mockTask.id);
    });

    it('should return null if task not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(null);

      const result = await controller.findOne('99');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const dto: UpdateTaskDto = { name: 'Updated Task' };
      const updatedTask = { ...mockTaskFactory(), name: 'Updated Task' };
      mockTaskService.update.mockResolvedValueOnce(updatedTask);

      const result = await controller.update('1', dto);

      expect(result).not.toBeNull();
      expect(result?.name).toBe('Updated Task');
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should remove a task', async () => {
      const result = await controller.remove('1');

      expect(result).toEqual({ deleted: true });
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
