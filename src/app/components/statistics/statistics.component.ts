import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ApiToken, ApiTokenService } from '../../services/api-token.service';
import { RecentRequest, StatsOverview, StatsService } from '../../services/stats.service';
import { BarRow } from '../charts/hbar-chart.component';
import { BarSeries } from '../charts/bar-chart.component';
import { CHART } from '../charts/chart-scale';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css'
})
export class StatisticsComponent implements OnInit {
  readonly periods = [{ days: 7, label: '7 jours' }, { days: 30, label: '30 jours' }, { days: 90, label: '90 jours' }];
  days = 30;
  tokenId: number | null = null;
  tokens: ApiToken[] = [];

  data: StatsOverview | null = null;
  recent: RecentRequest[] = [];
  loading = false;
  errorMessage = '';

  constructor(private stats: StatsService, private tokenService: ApiTokenService) { }

  ngOnInit(): void {
    this.tokenService.list().subscribe({ next: tokens => this.tokens = tokens, error: () => { /* the filter just stays empty */ } });
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';
    forkJoin([this.stats.overview(this.days, this.tokenId), this.stats.recent(this.days, this.tokenId, 20)]).subscribe({
      next: ([overview, recent]) => { this.data = overview; this.recent = recent; this.loading = false; },
      error: err => {
        this.loading = false;
        this.errorMessage = err.error?.error || 'Impossible de charger les statistiques.';
      }
    });
  }

  exportCsv(): void {
    this.stats.exportCsv(this.days, this.tokenId).subscribe({
      next: blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `api-usage-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
      },
      error: () => this.errorMessage = "L'export a échoué."
    });
  }

  // ---- data prepared for the charts and the tables

  get empty(): boolean { return !!this.data && this.data.totals.requests === 0; }

  get dayLabels(): string[] {
    return (this.data?.daily ?? []).map(d => `${d.date.slice(8, 10)}/${d.date.slice(5, 7)}`);
  }

  get volumeSeries(): BarSeries[] {
    const daily = this.data?.daily ?? [];
    return [
      { name: 'Réussies', color: CHART.blue, values: daily.map(d => d.requests - d.errors) },
      { name: 'En erreur', color: CHART.red, values: daily.map(d => d.errors) },
    ];
  }

  get latencyValues(): (number | null)[] { return (this.data?.daily ?? []).map(d => d.avg_ms); }

  get tokenRows(): BarRow[] {
    return (this.data?.tokens ?? []).map(t => ({
      label: t.name, value: t.requests,
      note: t.errors ? `${t.errors} err.` : undefined,
    }));
  }

  get fileTypeRows(): BarRow[] {
    return (this.data?.file_types ?? []).map(t => ({
      label: t.type === 'pdf' ? 'PDF' : t.type === 'image' ? 'Image' : 'Inconnu', value: t.requests,
    }));
  }

  get statusRows(): BarRow[] {
    return (this.data?.statuses ?? []).map(s => ({
      label: s.status === null ? 'Inconnu (ancien)' : this.statusLabel(s.status), value: s.requests,
      color: s.status !== null && s.status >= 400 ? CHART.red : CHART.blue,
    }));
  }

  statusLabel(code: number): string {
    return ({ 200: '200 · Réussie', 400: '400 · Fichier invalide', 500: '500 · Erreur interne' } as Record<number, string>)[code] ?? String(code);
  }

  // ---- formatting

  int(value: number | null | undefined): string { return value === null || value === undefined ? '–' : value.toLocaleString('fr-FR'); }
  ms(value: number | null | undefined): string { return value === null || value === undefined ? '–' : `${Math.round(value).toLocaleString('fr-FR')} ms`; }
  percent(rate: number): string { return (rate * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' %'; }

  size(bytes: number | null): string {
    if (bytes === null) return '–';
    return bytes >= 1_048_576 ? (bytes / 1_048_576).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' Mo'
                              : Math.max(1, Math.round(bytes / 1024)).toLocaleString('fr-FR') + ' Ko';
  }

  /** The API sends UTC times without a zone: add the "Z" so the browser shows them in the local time zone. */
  utc(time: string): string { return time + 'Z'; }

  statusClass(status: number | null): string {
    if (status === null) return 'bg-secondary';
    return status >= 500 ? 'bg-danger' : status >= 400 ? 'bg-warning text-dark' : 'bg-success';
  }
}
