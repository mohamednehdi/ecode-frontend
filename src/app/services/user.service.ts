import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface UserInfo {
  email: string;
  firstname: string;
  lastname: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private isAdminSubject = new BehaviorSubject<boolean>(false);
  isAdmin$ = this.isAdminSubject.asObservable();

  private usernameSubject = new BehaviorSubject<string>('');
  username$ = this.usernameSubject.asObservable();

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object,private http: HttpClient) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      this.setUser(user);
    }
  }

  setUser(user: any) {
    const isAdmin = user?.role === 'admin';
    const username = user?.username || '';
    this.isAdminSubject.next(isAdmin);
    this.usernameSubject.next(username);
  }

  clearUser() {
    this.isAdminSubject.next(false);
    this.usernameSubject.next('');
  }

loadUserInfo() {
  const token = localStorage.getItem('token');
  if (!token) return;

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  this.http.get('http://localhost:5000/auth/me', { headers }).subscribe((user: any) => {
    const username = `${user.firstname} ${user.lastname}`;
    this.usernameSubject.next(username);
    this.isAdminSubject.next(user.role === 'admin');
  }, error => {
    console.error('Failed to load user info', error);
  });
}
}
