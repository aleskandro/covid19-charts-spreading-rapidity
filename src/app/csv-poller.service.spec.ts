import { TestBed } from '@angular/core/testing';

import { CsvPollerService } from './csv-poller.service';

describe('CsvPollerService', () => {
  let service: CsvPollerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CsvPollerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
