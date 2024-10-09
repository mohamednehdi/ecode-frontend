import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  
}
