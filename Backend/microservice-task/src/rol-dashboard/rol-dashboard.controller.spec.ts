import { Test, TestingModule } from '@nestjs/testing';
import { RolDashboardController } from './rol-dashboard.controller';
import { RolDashboardService } from './rol-dashboard.service';

describe('RolDashboardController', () => {
  let controller: RolDashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolDashboardController],
      providers: [RolDashboardService],
    }).compile();

    controller = module.get<RolDashboardController>(RolDashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
