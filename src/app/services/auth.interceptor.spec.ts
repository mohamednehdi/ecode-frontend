import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';

import { authInterceptor } from './auth.interceptor';
import { API_URL } from '../api.config';

describe('authInterceptor', () => {
  let client: HttpClient;
  let http: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting(), provideRouter([])]
    });
    client = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
  });
  afterEach(() => { http.verify(); localStorage.clear(); });

  it('adds the session token to the requests sent to our API', () => {
    localStorage.setItem('token', 'tok123');
    client.get(`${API_URL}/admin/api-tokens`).subscribe();
    const req = http.expectOne(`${API_URL}/admin/api-tokens`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer tok123');
    req.flush([]);
  });

  it('sends no Authorization header when there is no session', () => {
    client.get(`${API_URL}/public/extract`).subscribe();
    const req = http.expectOne(`${API_URL}/public/extract`);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('never sends the token to another site', () => {
    localStorage.setItem('token', 'tok123');
    client.get('https://example.org/data').subscribe();
    const req = http.expectOne('https://example.org/data');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('clears the session and goes to the login page when the token is refused (401)', () => {
    localStorage.setItem('token', 'old');
    localStorage.setItem('user', '{"role":"admin"}');
    client.get(`${API_URL}/admin/api-tokens`).subscribe({ error: () => { /* expected */ } });
    http.expectOne(`${API_URL}/admin/api-tokens`).flush({ error: 'expired' }, { status: 401, statusText: 'Unauthorized' });
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('does not treat a wrong password (401 without a session) as an expired session', () => {
    client.post(`${API_URL}/auth/login`, {}).subscribe({ error: () => { /* expected */ } });
    http.expectOne(`${API_URL}/auth/login`).flush({ error: 'bad' }, { status: 401, statusText: 'Unauthorized' });
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
