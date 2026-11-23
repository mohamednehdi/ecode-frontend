import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { AuditComponent } from './audit.component';
import { AuditEntry, AuditPage, AuditService } from '../../services/audit.service';

const entry = (over: Partial<AuditEntry> = {}): AuditEntry => ({
  id: 1, time: '2026-11-23T10:00:00', actor_id: 1, actor_email: 'admin@x.com', action: 'login.success', target_type: null, target_id: null,
  target_name: null, details: null, ip: '203.0.113.5', success: true, ...over
});

const page = (items: AuditEntry[], next: number | null = null): AuditPage => ({ items, next_before_id: next, actions: ['login.success', 'login.failure', 'token.rotate'] });

describe('AuditComponent (audit log page)', () => {
  let fixture: ComponentFixture<AuditComponent>;
  let component: AuditComponent;
  let audit: jasmine.SpyObj<AuditService>;
  const text = () => (fixture.nativeElement as HTMLElement).textContent!.replace(/\s+/g, ' ');

  beforeEach(async () => {
    audit = jasmine.createSpyObj('AuditService', ['list', 'exportCsv']);
    audit.list.and.returnValue(of(page([entry({ id: 2 }), entry({ id: 1, action: 'login.failure', success: false, actor_email: 'ada@x.com' })])));
    await TestBed.configureTestingModule({
      declarations: [AuditComponent], imports: [FormsModule], providers: [{ provide: AuditService, useValue: audit }]
    }).compileComponents();
    fixture = TestBed.createComponent(AuditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the last 30 days with no filter when it opens', () => {
    expect(audit.list).toHaveBeenCalledWith({ days: 30, action: '', result: '', q: '' });
    expect(component.entries.length).toBe(2);
    expect(component.actions).toEqual(['login.success', 'login.failure', 'token.rotate']);
  });

  it('shows each entry with a French name for the event, the person and the address', () => {
    const shown = text();
    expect(shown).toContain('Connexion');
    expect(shown).toContain('Échec de connexion');
    expect(shown).toContain('ada@x.com');
    expect(shown).toContain('203.0.113.5');
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr').length).toBe(2);
  });

  it('names every kind of event, and falls back to the raw name for an unknown one', () => {
    for (const action of ['login.success', 'login.failure', 'login.locked', 'logout', 'token.create', 'token.update', 'token.rotate',
                          'token.delete', 'password.reset_request', 'password.reset_done', 'admin.cli']) {
      expect(component.label(action)).withContext(action).not.toBe(action);
    }
    expect(component.label('something.new')).toBe('something.new');
  });

  it('colours the bad news red, failures orange and key changes blue', () => {
    expect(component.badge(entry({ action: 'login.locked', success: false }))).toContain('danger');
    expect(component.badge(entry({ action: 'login.failure', success: false }))).toContain('warning');
    expect(component.badge(entry({ action: 'token.rotate' }))).toContain('primary');
    expect(component.badge(entry({ action: 'login.success' }))).toContain('success');
    expect(component.badge(entry({ action: 'logout' }))).toContain('secondary');
  });

  it('writes the details in a readable way: before → after for a change, a value otherwise', () => {
    expect(component.detailsText(entry())).toBe('');
    expect(component.detailsText(entry({ details: { quota_hourly: [10, 20], is_active: [true, false] } }))).toBe('quota_hourly : 10 → 20 · is_active : true → false');
    expect(component.detailsText(entry({ details: { grace_hours: 2, reason: 'wrong_password' } }))).toBe('grace_hours : 2 · reason : wrong_password');
    expect(component.detailsText(entry({ details: { allowed_ips: [[], ['10.0.0.1']] } }))).toBe('allowed_ips : ∅ → 10.0.0.1');
  });

  it('loads again from the newest entry when a filter changes', () => {
    component.filters = { days: 7, action: 'login.failure', result: 'false', q: 'ada' };
    component.load();
    expect(audit.list).toHaveBeenCalledWith({ days: 7, action: 'login.failure', result: 'false', q: 'ada' });
  });

  it('adds the older entries after the ones already shown, and stops when there are no more', () => {
    audit.list.and.returnValue(of(page([entry({ id: 5 })], 5)));
    component.load();
    expect(component.nextBeforeId).toBe(5);
    audit.list.and.returnValue(of(page([entry({ id: 4 })], null)));
    component.loadMore();
    expect(audit.list).toHaveBeenCalledWith(component.filters, 50, 5);
    expect(component.entries.map(e => e.id)).toEqual([5, 4]);
    expect(component.nextBeforeId).toBeNull();
    audit.list.calls.reset();
    component.loadMore();                                              // nothing more: no request
    expect(audit.list).not.toHaveBeenCalled();
  });

  it('shows the message of the server when the journal cannot be loaded', () => {
    audit.list.and.returnValue(throwError(() => ({ error: { error: 'Accès refusé' } })));
    component.load();
    expect(component.errorMessage).toBe('Accès refusé');
    expect(component.loading).toBeFalse();
  });

  it('exports the journal with the current filters', () => {
    audit.exportCsv.and.returnValue(of(new Blob(['a,b'])));
    spyOn(URL, 'createObjectURL').and.returnValue('blob:test');
    spyOn(URL, 'revokeObjectURL');
    component.filters.days = 90;
    component.exportCsv();
    expect(audit.exportCsv).toHaveBeenCalledWith(jasmine.objectContaining({ days: 90 }));
  });
});
