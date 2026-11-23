import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';

export interface AuditEntry {
  id: number;
  time: string;                       // UTC, ISO format without time zone
  actor_id: number | null;
  actor_email: string | null;
  action: string;
  target_type: string | null;
  target_id: number | null;
  target_name: string | null;
  details: Record<string, unknown> | null;
  ip: string | null;
  success: boolean;
}

export interface AuditPage {
  items: AuditEntry[];
  next_before_id: number | null;      // pass it as `beforeId` to get the older entries
  actions: string[];                  // every kind of entry the journal can hold
}

export interface AuditFilters { days: number; action: string; result: '' | 'true' | 'false'; q: string; }

// The Authorization header is added automatically by authInterceptor.
@Injectable({ providedIn: 'root' })
export class AuditService {
  private url = `${API_URL}/admin/audit`;

  constructor(private http: HttpClient) { }

  private params(filters: AuditFilters): HttpParams {
    let params = new HttpParams().set('days', filters.days);
    if (filters.action) params = params.set('action', filters.action);
    if (filters.result) params = params.set('success', filters.result);
    if (filters.q.trim()) params = params.set('q', filters.q.trim());
    return params;
  }

  list(filters: AuditFilters, limit = 50, beforeId: number | null = null): Observable<AuditPage> {
    let params = this.params(filters).set('limit', limit);
    if (beforeId !== null) params = params.set('before_id', beforeId);
    return this.http.get<AuditPage>(this.url, { params });
  }

  /** The journal of the period as a CSV file (a Blob: the download needs the Authorization header). */
  exportCsv(filters: AuditFilters): Observable<Blob> {
    return this.http.get(`${this.url}/export.csv`, { params: this.params(filters), responseType: 'blob' });
  }
}
