import { Test, TestingModule } from '@nestjs/testing';
import { RolDashboardService } from './rol-dashboard.service';

describe('RolDashboardService', () => {
  let service: RolDashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolDashboardService],
    }).compile();

    service = module.get<RolDashboardService>(RolDashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
