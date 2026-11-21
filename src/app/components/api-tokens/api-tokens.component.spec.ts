import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { ApiTokensComponent } from './api-tokens.component';
import { ApiToken, ApiTokenService } from '../../services/api-token.service';

const sampleToken = (over: Partial<ApiToken> = {}): ApiToken => ({
  id: 1, name: 'Compta', token_prefix: 'ecode_abcd', is_active: true, allowed_ips: ['10.0.0.1', '10.0.0.0/24'],
  allowed_types: ['QRCODE'], quota_hourly: 100, quota_monthly: null, valid_from: '2026-01-01T00:00:00',
  valid_until: '2026-12-31T23:59:59', created_at: null, last_used_at: null, usage_hour: 0, usage_month: 0, ...over
});

describe('ApiTokensComponent (key form)', () => {
  let component: ApiTokensComponent;
  let api: jasmine.SpyObj<ApiTokenService>;

  beforeEach(async () => {
    api = jasmine.createSpyObj('ApiTokenService', ['list', 'supportedTypes', 'create', 'update', 'delete']);
    api.list.and.returnValue(of([sampleToken()]));
    api.supportedTypes.and.returnValue(of(['QRCODE', 'DataMatrix']));
    await TestBed.configureTestingModule({
      declarations: [ApiTokensComponent], imports: [FormsModule], providers: [{ provide: ApiTokenService, useValue: api }]
    }).compileComponents();
    component = TestBed.createComponent(ApiTokensComponent).componentInstance;
    component.ngOnInit();
  });

  it('loads the keys and the barcode types at start', () => {
    expect(component.tokens.length).toBe(1);
    expect(component.supportedTypes).toEqual(['QRCODE', 'DataMatrix']);
    expect(component.loading).toBeFalse();
  });

  it('shows a message when the keys cannot be loaded', () => {
    api.list.and.returnValue(throwError(() => ({ error: { error: 'Accès refusé' } })));
    component.load();
    expect(component.errorMessage).toBe('Accès refusé');
  });

  it('wants a name', () => {
    component.openCreate();
    component.form.name = '   ';
    component.save();
    expect(component.formError).toBe('Le nom est obligatoire.');
    expect(api.create).not.toHaveBeenCalled();
  });

  it('builds the request from the form: IP list, empty quota = unlimited, last day included', () => {
    api.create.and.returnValue(of({ token: sampleToken({ name: 'Nouvelle' }), api_key: 'ecode_secret' }));
    component.openCreate();
    Object.assign(component.form, {
      name: '  Nouvelle  ', ipsText: '10.0.0.1, 10.0.0.0/24;\n192.168.1.5', quota_hourly: 50, quota_monthly: null,
      valid_from: '2026-02-01', valid_until: '2026-03-31'
    });
    component.toggleType('QRCODE');
    component.save();
    expect(api.create).toHaveBeenCalledWith({
      name: 'Nouvelle', is_active: true, allowed_ips: ['10.0.0.1', '10.0.0.0/24', '192.168.1.5'],
      allowed_types: ['QRCODE'], quota_hourly: 50, quota_monthly: null,
      valid_from: '2026-02-01', valid_until: '2026-03-31T23:59:59'
    });
  });

  it('shows the new key once, closes the form and reloads the list', () => {
    api.create.and.returnValue(of({ token: sampleToken({ name: 'Nouvelle' }), api_key: 'ecode_secret' }));
    component.openCreate();
    component.form.name = 'Nouvelle';
    component.save();
    expect(component.newKey).toBe('ecode_secret');
    expect(component.newKeyName).toBe('Nouvelle');
    expect(component.showForm).toBeFalse();
    expect(api.list).toHaveBeenCalledTimes(2);
  });

  it('shows the message of the server when saving fails', () => {
    api.create.and.returnValue(throwError(() => ({ error: { error: 'quota_hourly invalide' } })));
    component.openCreate();
    component.form.name = 'X';
    component.save();
    expect(component.formError).toBe('quota_hourly invalide');
    expect(component.saving).toBeFalse();
    expect(component.showForm).toBeTrue();
  });

  it('fills the form from an existing key when editing, and updates instead of creating', () => {
    api.update.and.returnValue(of(sampleToken()));
    component.openEdit(sampleToken());
    expect(component.form.ipsText).toBe('10.0.0.1\n10.0.0.0/24');
    expect(component.form.valid_from).toBe('2026-01-01');
    expect(component.form.valid_until).toBe('2026-12-31');
    component.save();
    expect(api.update).toHaveBeenCalled();
    expect(api.create).not.toHaveBeenCalled();
  });

  it('adds and removes an allowed type with toggleType', () => {
    component.openCreate();
    component.toggleType('QRCODE');
    component.toggleType('DataMatrix');
    component.toggleType('QRCODE');
    expect(component.form.allowed_types).toEqual(['DataMatrix']);
  });

  it('enables and disables a key from the list', () => {
    api.update.and.returnValue(of(sampleToken({ is_active: false })));
    component.toggleActive(component.tokens[0]);
    expect(api.update).toHaveBeenCalledWith(1, { is_active: false });
    expect(component.tokens[0].is_active).toBeFalse();
  });

  it('deletes a key only after confirmation', () => {
    api.delete.and.returnValue(of({}));
    const ask = spyOn(window, 'confirm');
    ask.and.returnValue(false);
    component.remove(component.tokens[0]);
    expect(api.delete).not.toHaveBeenCalled();
    ask.and.returnValue(true);
    component.remove(component.tokens[0]);
    expect(api.delete).toHaveBeenCalledWith(1);
    expect(component.tokens.length).toBe(0);
  });
});
