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
  rotated_at: string | null;
  /** While the previous key still works after a rotation: until when (UTC, no zone). */
  previous_key_valid_until: string | null;
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

  /** Gives the key a new secret; the old one keeps working for `graceHours` (0 = stops at once). The new key is in `api_key`, shown once. */
  rotate(id: number, graceHours: number): Observable<{ token: ApiToken; api_key: string }> {
    return this.http.post<{ token: ApiToken; api_key: string }>(`${this.url}/api-tokens/${id}/rotate`, { grace_hours: graceHours });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.url}/api-tokens/${id}`);
  }
}
