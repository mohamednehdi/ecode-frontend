import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { StatisticsComponent } from './statistics.component';
import { BarChartComponent } from '../charts/bar-chart.component';
import { LineChartComponent } from '../charts/line-chart.component';
import { HBarChartComponent } from '../charts/hbar-chart.component';
import { ApiTokenService } from '../../services/api-token.service';
import { RecentRequest, StatsOverview, StatsService } from '../../services/stats.service';

const overview = (requests = 100): StatsOverview => ({
  period: { days: 30, from: '2026-10-22T00:00:00', to: '2026-11-20T12:00:00', token_id: null },
  totals: {
    requests, errors: requests ? 4 : 0, error_rate: requests ? 0.04 : 0, avg_ms: 123.4, p50_ms: 75, p95_ms: 375,
    codes_found: 250, pages: 140, bytes: 5_000_000, thorough_requests: 12
  },
  daily: [
    { date: '2026-11-18', requests: 40, errors: 1, avg_ms: 110 },
    { date: '2026-11-19', requests: 0, errors: 0, avg_ms: null },
    { date: '2026-11-20', requests: 60, errors: 3, avg_ms: 130 },
  ],
  tokens: [{ id: 1, name: 'Compta', requests: 100, errors: 4, avg_ms: 123, last_request: '2026-11-20T11:00:00' }],
  file_types: [{ type: 'pdf', requests: 30 }, { type: 'image', requests: 70 }],
  statuses: [{ status: 200, requests: 96 }, { status: 400, requests: 3 }, { status: 500, requests: 1 }, { status: null, requests: 0 }],
});

const recentRow: RecentRequest = {
  id: 1, time: '2026-11-20T11:00:00', token_id: 1, token_name: 'Compta', status: 200, duration_ms: 48, codes_found: 2, pages: 1,
  file_type: 'image', file_bytes: 120_000, thorough: false, ip: '203.0.113.5'
};

describe('StatisticsComponent', () => {
  let fixture: ComponentFixture<StatisticsComponent>;
  let component: StatisticsComponent;
  let stats: jasmine.SpyObj<StatsService>;

  const text = () => (fixture.nativeElement as HTMLElement).textContent!.replace(/\s/g, '');

  beforeEach(async () => {
    stats = jasmine.createSpyObj('StatsService', ['overview', 'recent', 'exportCsv']);
    stats.overview.and.returnValue(of(overview()));
    stats.recent.and.returnValue(of([recentRow]));
    const tokens = jasmine.createSpyObj('ApiTokenService', ['list']);
    tokens.list.and.returnValue(of([{ id: 1, name: 'Compta' }]));
    await TestBed.configureTestingModule({
      declarations: [StatisticsComponent, BarChartComponent, LineChartComponent, HBarChartComponent],
      imports: [FormsModule],
      providers: [{ provide: StatsService, useValue: stats }, { provide: ApiTokenService, useValue: tokens }]
    }).compileComponents();
    fixture = TestBed.createComponent(StatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the last 30 days for all the keys when it opens', () => {
    expect(stats.overview).toHaveBeenCalledWith(30, null);
    expect(stats.recent).toHaveBeenCalledWith(30, null, 20);
    expect(component.data?.totals.requests).toBe(100);
  });

  it('shows the key figures', () => {
    const page = text();
    expect(page).toContain('Requêtes');
    expect(page).toContain('100');                    // requests
    expect(page).toContain('4%');                     // error rate
    expect(page).toContain('123ms');                  // average time
    expect(page).toContain('375ms');                  // 95 % of the requests under
    expect(page).toContain('250');                    // codes found
  });

  it('draws the three kinds of chart and the table of latest requests', () => {
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('app-bar-chart svg').length).toBe(1);
    expect(root.querySelectorAll('app-line-chart svg').length).toBe(1);
    expect(root.querySelectorAll('app-hbar-chart').length).toBe(3);      // per key, file types, results
    expect(root.querySelectorAll('tbody tr').length).toBeGreaterThanOrEqual(1);
  });

  it('splits each day into successful and failed requests (the stack of the chart)', () => {
    const [ok, failed] = component.volumeSeries;
    expect(ok.values).toEqual([39, 0, 57]);
    expect(failed.values).toEqual([1, 0, 3]);
  });

  it('labels the days dd/MM and keeps a gap for a day without data', () => {
    expect(component.dayLabels).toEqual(['18/11', '19/11', '20/11']);
    expect(component.latencyValues).toEqual([110, null, 130]);
  });

  it('colours the failed results in red and names the codes', () => {
    const rows = component.statusRows;
    expect(rows.find(r => r.label.startsWith('200'))!.color).not.toBe(rows.find(r => r.label.startsWith('500'))!.color);
    expect(component.statusLabel(400)).toBe('400 · Fichier invalide');
    expect(component.statusLabel(418)).toBe('418');
  });

  it('formats numbers the French way', () => {
    expect(component.percent(0.024)).toBe('2,4 %');
    expect(component.ms(1234.4)).toContain('1');
    expect(component.ms(null)).toBe('–');
    expect(component.size(2_097_152)).toBe('2 Mo');
    expect(component.size(300 * 1024)).toBe('300 Ko');
    expect(component.size(null)).toBe('–');
  });

  it('loads again with the new period and key when the filters change', () => {
    component.days = 7;
    component.tokenId = 1;
    component.load();
    expect(stats.overview).toHaveBeenCalledWith(7, 1);
    expect(stats.recent).toHaveBeenCalledWith(7, 1, 20);
  });

  it('shows an empty state instead of empty charts when nothing was received', () => {
    stats.overview.and.returnValue(of(overview(0)));
    component.load();
    fixture.detectChanges();
    expect(component.empty).toBeTrue();
    expect(text()).toContain('Aucunerequêtesurcettepériode');
    expect((fixture.nativeElement as HTMLElement).querySelector('app-bar-chart')).toBeNull();
  });

  it('shows the message of the server when the statistics cannot be loaded', () => {
    stats.overview.and.returnValue(throwError(() => ({ error: { error: 'Accès refusé' } })));
    component.load();
    fixture.detectChanges();
    expect(component.errorMessage).toBe('Accès refusé');
    expect(component.loading).toBeFalse();
  });

  it('exports the CSV of the current period and key', () => {
    stats.exportCsv.and.returnValue(of(new Blob(['a,b'])));
    spyOn(URL, 'createObjectURL').and.returnValue('blob:test');
    spyOn(URL, 'revokeObjectURL');
    component.days = 90;
    component.exportCsv();
    expect(stats.exportCsv).toHaveBeenCalledWith(90, null);
  });
});
