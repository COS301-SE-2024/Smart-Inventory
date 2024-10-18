import { TestBed } from '@angular/core/testing';

import { SecureDataService } from './secure-data.service';

describe('SecureDataService', () => {
  let service: SecureDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SecureDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
