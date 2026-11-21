import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { UserService } from './user.service';
import { API_URL } from '../api.config';

describe('UserService', () => {
  const create = () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    return { service: TestBed.inject(UserService), http: TestBed.inject(HttpTestingController) };
  };

  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('starts as a visitor when nothing is stored', async () => {
    const { service } = create();
    expect(await firstValueFrom(service.isAdmin$)).toBeFalse();
  });

  it('recognises an administrator stored by a previous visit', async () => {
    localStorage.setItem('user', JSON.stringify({ role: 'admin' }));
    const { service } = create();
    expect(await firstValueFrom(service.isAdmin$)).toBeTrue();
  });

  it('setUser and clearUser change the administrator flag', async () => {
    const { service } = create();
    service.setUser({ role: 'admin', username: 'Ada' });
    expect(await firstValueFrom(service.isAdmin$)).toBeTrue();
    expect(await firstValueFrom(service.username$)).toBe('Ada');
    service.clearUser();
    expect(await firstValueFrom(service.isAdmin$)).toBeFalse();
    expect(await firstValueFrom(service.username$)).toBe('');
  });

  it('does not call the server without a session', () => {
    const { service, http } = create();
    service.loadUserInfo();
    http.expectNone(`${API_URL}/auth/me`);
    http.verify();
  });

  it('loads the name and the role of the logged-in user', async () => {
    localStorage.setItem('token', 'tok');
    const { service, http } = create();
    service.loadUserInfo();
    http.expectOne(`${API_URL}/auth/me`).flush({ firstname: 'Ada', lastname: 'Lovelace', role: 'admin' });
    expect(await firstValueFrom(service.username$)).toBe('Ada Lovelace');
    expect(await firstValueFrom(service.isAdmin$)).toBeTrue();
  });
});
