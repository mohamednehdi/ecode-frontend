import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { StatsService } from './stats.service';
import { API_URL } from '../api.config';

describe('StatsService', () => {
  let service: StatsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(StatsService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('asks for the overview of a period, for all the keys', () => {
    service.overview(30, null).subscribe();
    const req = http.expectOne(r => r.url === `${API_URL}/admin/stats/overview`);
    expect(req.request.params.get('days')).toBe('30');
    expect(req.request.params.has('token_id')).toBeFalse();
    req.flush({});
  });

  it('asks for the overview of one key', () => {
    service.overview(7, 3).subscribe();
    const req = http.expectOne(r => r.url === `${API_URL}/admin/stats/overview`);
    expect(req.request.params.get('days')).toBe('7');
    expect(req.request.params.get('token_id')).toBe('3');
    req.flush({});
  });

  it('asks for the latest requests with a limit', () => {
    service.recent(30, 3, 20).subscribe();
    const req = http.expectOne(r => r.url === `${API_URL}/admin/stats/recent`);
    expect(req.request.params.get('limit')).toBe('20');
    expect(req.request.params.get('token_id')).toBe('3');
    req.flush([]);
  });

  it('downloads the CSV export as a file (a Blob), not as JSON', () => {
    service.exportCsv(90, null).subscribe();
    const req = http.expectOne(r => r.url === `${API_URL}/admin/stats/export.csv`);
    expect(req.request.responseType).toBe('blob');
    expect(req.request.params.get('days')).toBe('90');
    req.flush(new Blob(['a,b']));
  });
});
