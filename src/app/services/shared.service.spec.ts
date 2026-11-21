import { TestBed } from '@angular/core/testing';

import { SharedService } from './shared.service';

describe('SharedService (token passed between the password-reset steps)', () => {
  let service: SharedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedService);
  });

  it('has no token at first', () => expect(service.getToken()).toBeNull());

  it('keeps the token it is given and forgets it when cleared', () => {
    service.setToken('abc');
    expect(service.getToken()).toBe('abc');
    service.clearToken();
    expect(service.getToken()).toBeNull();
  });
});
