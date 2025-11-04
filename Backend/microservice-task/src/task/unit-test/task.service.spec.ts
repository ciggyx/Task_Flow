import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from '../task.service';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { Priority } from 'src/priority/entities/priority.entity';
import { Status } from 'src/status/entities/status.entity';
import { Dashboard } from 'src/dashboard/entities/dashboard.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from '../dto/create-task.dto';

describe('TaskService', () => {
  let service: TaskService;
  let taskRepository: Repository<Task>;
  let priorityRepository: Repository<Priority>;
  let statusRepository: Repository<Status>;
  let dashboardRepository: Repository<Dashboard>;

  // 🧩 Mock adaptado a tu entidad real (usa solo IDs)
  const mockTask = {
    id: 1,
    name: 'Test Task',
    description: 'Task description',
    startDate: new Date(),
    endDate: new Date(),
    statusId: 1,
    priorityId: 2,
    dashboardId: 3,
  } as Task;

  const mockTaskRepository = {
    create: jest.fn().mockReturnValue(mockTask),
    save: jest.fn().mockResolvedValue(mockTask),
    find: jest.fn().mockResolvedValue([mockTask]),
    findOne: jest.fn().mockResolvedValue(mockTask),
    findOneBy: jest.fn().mockResolvedValue(mockTask),
    delete: jest.fn().mockResolvedValue({}),
  };

  const mockPriorityRepository = {
    findOneBy: jest.fn().mockResolvedValue({ id: 2, name: 'High' }),
  };

  const mockStatusRepository = {
    findOneBy: jest.fn().mockResolvedValue({ id: 1, name: 'Pending' }),
  };

  const mockDashboardRepository = {
    findOneBy: jest.fn().mockResolvedValue({ id: 3, name: 'Main Dashboard' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: getRepositoryToken(Task), useValue: mockTaskRepository },
        { provide: getRepositoryToken(Priority), useValue: mockPriorityRepository },
        { provide: getRepositoryToken(Status), useValue: mockStatusRepository },
        { provide: getRepositoryToken(Dashboard), useValue: mockDashboardRepository },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    priorityRepository = module.get<Repository<Priority>>(getRepositoryToken(Priority));
    statusRepository = module.get<Repository<Status>>(getRepositoryToken(Status));
    dashboardRepository = module.get<Repository<Dashboard>>(getRepositoryToken(Dashboard));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a task successfully', async () => {
      const dto: CreateTaskDto = {
        name: 'New Task',
        description: 'Task desc',
        endDate: new Date(),
        statusId: 1,
        priorityId: 2,
        dashboardId: 3,
      };

      const result = await service.create(dto);

      expect(statusRepository.findOneBy).toHaveBeenCalledWith({ id: dto.statusId });
      expect(priorityRepository.findOneBy).toHaveBeenCalledWith({ id: dto.priorityId });
      expect(dashboardRepository.findOneBy).toHaveBeenCalledWith({ id: dto.dashboardId });
      expect(taskRepository.create).toHaveBeenCalled();
      expect(taskRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if status not found', async () => {
      jest.spyOn(statusRepository, 'findOneBy').mockResolvedValueOnce(null);

      const dto: CreateTaskDto = {
        name: 'New Task',
        description: 'Task desc',
        endDate: new Date(),
        statusId: 99,
        priorityId: 2,
        dashboardId: 3,
      };

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if dashboard not found', async () => {
      jest.spyOn(dashboardRepository, 'findOneBy').mockResolvedValueOnce(null);

      const dto: CreateTaskDto = {
        name: 'New Task',
        description: 'Task desc',
        endDate: new Date(),
        statusId: 1,
        priorityId: 2,
        dashboardId: 99,
      };

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return an array of tasks', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockTask]);
      expect(taskRepository.find).toHaveBeenCalledWith({
        relations: ['status', 'priority', 'dashboard'],
      });
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      const result = await service.findOne(1);
      expect(result).toEqual(mockTask);
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['status', 'priority', 'dashboard'],
      });
    });
  });

  describe('update', () => {
    it('should call findOne and return a task', async () => {
      const result = await service.update(1, { name: 'Updated Task' });
      expect(result).toEqual(mockTask);
      expect(taskRepository.findOne).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a task if it exists', async () => {
      jest.spyOn(taskRepository, 'findOne').mockResolvedValueOnce(mockTask);

      await service.remove(1);

      expect(taskRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(taskRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if task not found', async () => {
      jest.spyOn(taskRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
