import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AdminGuard } from './admin.guard';

describe('AdminGuard', () => {
  let router: jasmine.SpyObj<Router>;
  const run = () => TestBed.runInInjectionContext(() => AdminGuard({} as any, {} as any));

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({ providers: [{ provide: Router, useValue: router }] });
    localStorage.clear();
  });
  afterEach(() => localStorage.clear());

  it('sends a visitor without a session to the login page', () => {
    expect(run()).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('refuses a logged-in user who is not an administrator', () => {
    localStorage.setItem('token', 'abc');
    localStorage.setItem('user', JSON.stringify({ role: 'user' }));
    expect(run()).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('refuses a stored administrator role without a token', () => {
    localStorage.setItem('user', JSON.stringify({ role: 'admin' }));
    expect(run()).toBeFalse();
  });

  it('lets an administrator with a token in', () => {
    localStorage.setItem('token', 'abc');
    localStorage.setItem('user', JSON.stringify({ role: 'admin' }));
    expect(run()).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
