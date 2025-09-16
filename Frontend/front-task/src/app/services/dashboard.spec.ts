import { TestBed } from '@angular/core/testing';

import { DashBoardService } from './dashboard.service';

describe('DashBoard', () => {
  let service: DashBoardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashBoardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
