import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';

export interface ApiToken {
  id: number;
  name: string;
  token_prefix: string;
  is_active: boolean;
  allowed_ips: string[];
  allowed_types: string[];
  quota_hourly: number | null;
  quota_monthly: number | null;
  valid_from: string | null;
  valid_until: string | null;
  created_at: string | null;
  last_used_at: string | null;
  usage_hour: number;
  usage_month: number;
}

/** Fields sent when creating or editing a token (empty list / null = no restriction). */
export interface ApiTokenPayload {
  name: string;
  is_active: boolean;
  allowed_ips: string[];
  allowed_types: string[];
  quota_hourly: number | null;
  quota_monthly: number | null;
  valid_from: string | null;
  valid_until: string | null;
}

// The Authorization header is added automatically by authInterceptor.
@Injectable({ providedIn: 'root' })
export class ApiTokenService {
  private url = `${API_URL}/admin`;

  constructor(private http: HttpClient) { }

  list(): Observable<ApiToken[]> {
    return this.http.get<ApiToken[]>(`${this.url}/api-tokens`);
  }

  supportedTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.url}/supported-types`);
  }

  /** The response holds `api_key`, the only time the full key is ever shown. */
  create(payload: ApiTokenPayload): Observable<{ token: ApiToken; api_key: string }> {
    return this.http.post<{ token: ApiToken; api_key: string }>(`${this.url}/api-tokens`, payload);
  }

  update(id: number, payload: Partial<ApiTokenPayload>): Observable<ApiToken> {
    return this.http.put<ApiToken>(`${this.url}/api-tokens/${id}`, payload);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.url}/api-tokens/${id}`);
  }
}
