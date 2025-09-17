import { TestBed } from '@angular/core/testing';

import { AdobeSignService } from './adobe-sign.service';

describe('AdobeSignService', () => {
  let service: AdobeSignService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdobeSignService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
