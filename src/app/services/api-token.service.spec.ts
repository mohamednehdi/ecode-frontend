import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ApiTokenPayload, ApiTokenService } from './api-token.service';
import { API_URL } from '../api.config';

describe('ApiTokenService', () => {
  let service: ApiTokenService;
  let http: HttpTestingController;
  const payload: ApiTokenPayload = {
    name: 'App', is_active: true, allowed_ips: ['10.0.0.1'], allowed_types: ['QRCODE'],
    quota_hourly: 100, quota_monthly: null, valid_from: null, valid_until: '2027-01-01T23:59:59'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ApiTokenService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('lists the keys and the supported barcode types', () => {
    service.list().subscribe();
    expect(http.expectOne(`${API_URL}/admin/api-tokens`).request.method).toBe('GET');
    service.supportedTypes().subscribe();
    expect(http.expectOne(`${API_URL}/admin/supported-types`).request.method).toBe('GET');
  });

  it('creates a key with the whole form as the body', () => {
    service.create(payload).subscribe();
    const req = http.expectOne(`${API_URL}/admin/api-tokens`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
  });

  it('updates and deletes a key by its id', () => {
    service.update(7, { is_active: false }).subscribe();
    const put = http.expectOne(`${API_URL}/admin/api-tokens/7`);
    expect(put.request.method).toBe('PUT');
    expect(put.request.body).toEqual({ is_active: false });

    service.delete(7).subscribe();
    expect(http.expectOne(`${API_URL}/admin/api-tokens/7`).request.method).toBe('DELETE');
  });
});
