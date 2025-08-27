import { TestBed } from '@angular/core/testing';

import { DashBoard } from './dashboard.service';

describe('DashBoard', () => {
  let service: DashBoard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashBoard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
