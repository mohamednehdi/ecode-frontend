import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class UserService {
  private isAdminSubject = new BehaviorSubject<boolean>(false);
  isAdmin$ = this.isAdminSubject.asObservable();

  private usernameSubject = new BehaviorSubject<string>('');
  username$ = this.usernameSubject.asObservable();

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object, private http: HttpClient) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      this.setUser(user);
    }
  }

  setUser(user: any) {
    this.isAdminSubject.next(user?.role === 'admin');
    this.usernameSubject.next(user?.username || '');
  }

  clearUser() {
    this.isAdminSubject.next(false);
    this.usernameSubject.next('');
  }

  loadUserInfo() {
    if (!this.isBrowser || !localStorage.getItem('token')) return;

    // Authorization header is added by authInterceptor
    this.http.get<any>(`${API_URL}/auth/me`).subscribe({
      next: user => {
        this.usernameSubject.next(`${user.firstname ?? ''} ${user.lastname ?? ''}`.trim());
        this.isAdminSubject.next(user.role === 'admin');
      },
      error: error => console.error('Failed to load user info', error)
    });
  }
}
