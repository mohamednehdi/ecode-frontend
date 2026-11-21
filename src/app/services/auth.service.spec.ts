import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { API_URL } from '../api.config';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
  });
  afterEach(() => { http.verify(); localStorage.clear(); });

  it('sends the email and the password to the login route', () => {
    service.login('a@b.com', 'secret123').subscribe();
    const req = http.expectOne(`${API_URL}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'a@b.com', password: 'secret123' });
    req.flush({});
  });

  it('keeps the session in the browser and tells the user service who is logged in', async () => {
    service.saveSession('tok123', 'admin');
    expect(service.getToken()).toBe('tok123');
    expect(service.getUser()).toEqual({ role: 'admin' });
    expect(await firstValueFrom(TestBed.inject(UserService).isAdmin$)).toBeTrue();
  });

  it('has no session when nothing is stored', () => {
    expect(service.getToken()).toBeNull();
    expect(service.getUser()).toBeNull();
  });

  it('logout revokes the token on the server, then clears the session and goes to the login page', () => {
    service.saveSession('tok123', 'admin');
    service.logout();
    http.expectOne(`${API_URL}/auth/logout`).flush({});
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('logout clears the session even when the server refuses (token already invalid)', () => {
    service.saveSession('tok123', 'admin');
    service.logout();
    http.expectOne(`${API_URL}/auth/logout`).flush({ error: 'expired' }, { status: 401, statusText: 'Unauthorized' });
    expect(localStorage.getItem('token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('uses the right routes and bodies for the password reset steps', () => {
    service.requestResetPassword('a@b.com').subscribe();
    expect(http.expectOne(`${API_URL}/auth/request-password-reset`).request.body).toEqual({ email: 'a@b.com' });

    service.verifyCode('t1', '123456').subscribe();
    expect(http.expectOne(`${API_URL}/auth/verify-code`).request.body).toEqual({ token: 't1', code: '123456' });

    service.resetPassword('t2', 'newpassword1').subscribe();
    expect(http.expectOne(`${API_URL}/auth/reset-password`).request.body).toEqual({ token: 't2', password: 'newpassword1' });
  });
});
