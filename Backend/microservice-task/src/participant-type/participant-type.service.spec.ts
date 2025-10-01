import { Test, TestingModule } from '@nestjs/testing';
import { ParticipantTypeService } from './participant-type.service';

describe('ParticipantTypeService', () => {
  let service: ParticipantTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParticipantTypeService],
    }).compile();

    service = module.get<ParticipantTypeService>(ParticipantTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
