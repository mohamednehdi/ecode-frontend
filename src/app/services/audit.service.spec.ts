import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuditFilters, AuditService } from './audit.service';
import { API_URL } from '../api.config';

describe('AuditService', () => {
  let service: AuditService;
  let http: HttpTestingController;
  const none: AuditFilters = { days: 30, action: '', result: '', q: '' };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AuditService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('asks for the newest entries of a period, with no other filter', () => {
    service.list(none, 50).subscribe();
    const req = http.expectOne(r => r.url === `${API_URL}/admin/audit`);
    expect(req.request.params.get('days')).toBe('30');
    expect(req.request.params.get('limit')).toBe('50');
    for (const absent of ['action', 'success', 'q', 'before_id']) expect(req.request.params.has(absent)).withContext(absent).toBeFalse();
    req.flush({ items: [], next_before_id: null, actions: [] });
  });

  it('sends the filters the administrator chose, and ignores a blank search', () => {
    service.list({ days: 7, action: 'login.failure', result: 'false', q: '  ada@x.com ' }, 20, 99).subscribe();
    const req = http.expectOne(r => r.url === `${API_URL}/admin/audit`);
    expect(req.request.params.get('action')).toBe('login.failure');
    expect(req.request.params.get('success')).toBe('false');
    expect(req.request.params.get('q')).toBe('ada@x.com');
    expect(req.request.params.get('before_id')).toBe('99');
    req.flush({ items: [], next_before_id: null, actions: [] });

    service.list({ ...none, q: '   ' }).subscribe();
    const blank = http.expectOne(r => r.url === `${API_URL}/admin/audit`);
    expect(blank.request.params.has('q')).toBeFalse();
    blank.flush({ items: [], next_before_id: null, actions: [] });
  });

  it('downloads the CSV export as a file (a Blob) for the same filters', () => {
    service.exportCsv({ ...none, days: 90, action: 'token.rotate' }).subscribe();
    const req = http.expectOne(r => r.url === `${API_URL}/admin/audit/export.csv`);
    expect(req.request.responseType).toBe('blob');
    expect(req.request.params.get('days')).toBe('90');
    expect(req.request.params.get('action')).toBe('token.rotate');
    req.flush(new Blob(['a,b']));
  });
});
