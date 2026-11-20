import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';

export interface StatsTotals {
  requests: number;
  errors: number;
  error_rate: number;          // 0-1
  avg_ms: number | null;
  p50_ms: number | null;       // from a histogram of 10 ms bins: exact to about +-5 ms
  p95_ms: number | null;
  codes_found: number;
  pages: number;
  bytes: number;
  thorough_requests: number;
}

export interface DailyStat { date: string; requests: number; errors: number; avg_ms: number | null; }
export interface TokenStat { id: number; name: string; requests: number; errors: number; avg_ms: number | null; last_request: string | null; }

export interface StatsOverview {
  period: { days: number; from: string; to: string; token_id: number | null };
  totals: StatsTotals;
  daily: DailyStat[];
  tokens: TokenStat[];
  file_types: { type: string; requests: number }[];
  statuses: { status: number | null; requests: number }[];
}

export interface RecentRequest {
  id: number;
  time: string;                // UTC, ISO format without time zone
  token_id: number;
  token_name: string;
  status: number | null;       // null for requests logged before the statistics existed
  duration_ms: number | null;
  codes_found: number | null;
  pages: number | null;
  file_type: string | null;
  file_bytes: number | null;
  thorough: boolean | null;
  ip: string | null;
}

// The Authorization header is added automatically by authInterceptor.
@Injectable({ providedIn: 'root' })
export class StatsService {
  private url = `${API_URL}/admin/stats`;

  constructor(private http: HttpClient) { }

  private params(days: number, tokenId: number | null, extra: Record<string, string> = {}): HttpParams {
    let params = new HttpParams().set('days', days);
    if (tokenId !== null) params = params.set('token_id', tokenId);
    for (const [key, value] of Object.entries(extra)) params = params.set(key, value);
    return params;
  }

  overview(days: number, tokenId: number | null): Observable<StatsOverview> {
    return this.http.get<StatsOverview>(`${this.url}/overview`, { params: this.params(days, tokenId) });
  }

  recent(days: number, tokenId: number | null, limit = 20): Observable<RecentRequest[]> {
    return this.http.get<RecentRequest[]>(`${this.url}/recent`, { params: this.params(days, tokenId, { limit: String(limit) }) });
  }

  /** The request log of the period as a CSV file (a Blob: the download needs the Authorization header). */
  exportCsv(days: number, tokenId: number | null): Observable<Blob> {
    return this.http.get(`${this.url}/export.csv`, { params: this.params(days, tokenId), responseType: 'blob' });
  }
}
