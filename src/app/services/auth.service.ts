import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { UserService } from './user.service';
import { API_URL } from '../api.config';

// The Authorization header is added automatically by authInterceptor.
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = `${API_URL}/auth`;

  constructor(private http: HttpClient, private userService: UserService, private router: Router) { }

  login(email: string, password: string): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.baseUrl}/login`, { email, password }, { observe: 'response' });
  }

  /** Saves the session after a successful login. */
  saveSession(token: string, role: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ role }));
    this.userService.setUser({ role });
  }

  /** Revokes the token on the server, then clears the local session. */
  logout(): void {
    this.http.post(`${this.baseUrl}/logout`, {}).pipe(
      finalize(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.userService.clearUser();
        this.router.navigate(['/login']);
      })
    ).subscribe({ error: () => { /* token already invalid: nothing to revoke */ } });
  }

  requestResetPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/request-password-reset`, { email });
  }

  /** On success the response contains `reset_token`, needed by resetPassword(). */
  verifyCode(token: string, code: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/verify-code`, { token, code });
  }

  resetPassword(resetToken: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password`, { token: resetToken, password });
  }

  getUser() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
