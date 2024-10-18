import { TestBed } from '@angular/core/testing';

import { LocalstorageCleanerService } from './localstorage-cleaner.service';

describe('LocalstorageCleanerService', () => {
  let service: LocalstorageCleanerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalstorageCleanerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
