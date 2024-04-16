import { TestBed } from '@angular/core/testing';

import { CrossCalendarService } from './cross-calendar.service';

describe('CrossCalendarService', () => {
  let service: CrossCalendarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrossCalendarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
