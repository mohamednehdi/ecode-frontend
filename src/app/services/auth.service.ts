import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  

  private baseUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) { }

  register(email: string, password: string): Observable<HttpResponse<any>> {
    return this.http.post(`${this.baseUrl}/register`, { email, password }, { observe: 'response' });
  }

  login(email: string, password: string): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.baseUrl}/login`, { email, password }, { observe: 'response' });
  }
  // login(email: string, password: string): Observable<any> {
  //   return this.http.post<any>(`${this.baseUrl}/login`, { email, password }).pipe(
  //     tap(response => {
  //       if (response.access_token) {
  //         localStorage.setItem('token', response.access_token); // Store token
  //       }
  //     })
  //   );
  // }
  

  requestResetPassword(email: string): Observable<any> {
    const url = `${this.baseUrl}/request-password-reset`;
    return this.http.post<any>(url, { email });
  }

  verifyCode(token: string, code: string): Observable<any> {
    const url = `${this.baseUrl}/verify-code`;
    return this.http.post(url, { token, code });
  }

  resetPassword(token: string, password: string): Observable<any> {
    const url = `${this.baseUrl}/reset-password`;
    return this.http.post(url, { token, password });
  }
  
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users`);
  }

  getUser() {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
  }
  
  getPendingUsers(): Observable<any[]> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    return this.http.get<any[]>(`${this.baseUrl}/users`, { headers });
  }
  
  getToken(): string | null {
    return localStorage.getItem('token'); // Assuming token is stored in localStorage after login
  }
  getActiveUsers():Observable<any[]>  {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    return this.http.get<any[]>(`${this.baseUrl}/active-users`, { headers });
  }
  approveUser(user_id: number): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.baseUrl}/approve-user/${user_id}`, {},{headers});
  }
  deleteUser(user_id: number): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.baseUrl}/delete-user/${user_id}`,{headers});
  }
}
