import { Component, OnInit } from '@angular/core';
import { AuditEntry, AuditFilters, AuditService } from '../../services/audit.service';

/** French names of the kinds of entry of the journal. */
const LABELS: Record<string, string> = {
  'login.success': 'Connexion',
  'login.failure': 'Échec de connexion',
  'login.locked': 'Adresse verrouillée',
  'logout': 'Déconnexion',
  'token.create': 'Clé créée',
  'token.update': 'Clé modifiée',
  'token.rotate': 'Clé renouvelée',
  'token.delete': 'Clé supprimée',
  'password.reset_request': 'Mot de passe oublié',
  'password.reset_done': 'Mot de passe réinitialisé',
  'admin.cli': 'Commande administrateur',
};

@Component({
  selector: 'app-audit',
  templateUrl: './audit.component.html',
  styleUrl: './audit.component.css'
})
export class AuditComponent implements OnInit {
  readonly periods = [{ days: 7, label: '7 jours' }, { days: 30, label: '30 jours' }, { days: 90, label: '90 jours' }, { days: 365, label: '1 an' }];
  filters: AuditFilters = { days: 30, action: '', result: '', q: '' };
  actions: string[] = [];

  entries: AuditEntry[] = [];
  nextBeforeId: number | null = null;
  loading = false;
  errorMessage = '';

  constructor(private audit: AuditService) { }

  ngOnInit(): void { this.load(); }

  /** (Re)starts from the newest entry with the current filters. */
  load(): void {
    this.loading = true;
    this.errorMessage = '';
    this.audit.list(this.filters).subscribe({
      next: page => { this.entries = page.items; this.nextBeforeId = page.next_before_id; this.actions = page.actions; this.loading = false; },
      error: err => { this.loading = false; this.errorMessage = err.error?.error || "Impossible de charger le journal."; }
    });
  }

  loadMore(): void {
    if (this.nextBeforeId === null) return;
    this.loading = true;
    this.audit.list(this.filters, 50, this.nextBeforeId).subscribe({
      next: page => { this.entries = [...this.entries, ...page.items]; this.nextBeforeId = page.next_before_id; this.loading = false; },
      error: err => { this.loading = false; this.errorMessage = err.error?.error || 'Impossible de charger la suite.'; }
    });
  }

  exportCsv(): void {
    this.audit.exportCsv(this.filters).subscribe({
      next: blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `audit-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
      },
      error: () => this.errorMessage = "L'export a échoué."
    });
  }

  label(action: string): string { return LABELS[action] ?? action; }

  /** Colour of the badge: bad news in red, changes to the keys in orange, the rest neutral or green. */
  badge(entry: AuditEntry): string {
    if (entry.action === 'login.locked') return 'bg-danger';
    if (!entry.success) return 'bg-warning text-dark';
    if (entry.action.startsWith('token.')) return 'bg-primary';
    return entry.action === 'login.success' ? 'bg-success' : 'bg-secondary';
  }

  /** "quota_hourly: 10 → 20" for a change, "grace_hours: 2" for a value. */
  detailsText(entry: AuditEntry): string {
    if (!entry.details) return '';
    return Object.entries(entry.details).map(([key, value]) => {
      if (Array.isArray(value) && value.length === 2) return `${key} : ${this.show(value[0])} → ${this.show(value[1])}`;
      return `${key} : ${this.show(value)}`;
    }).join(' · ');
  }

  private show(value: unknown): string {
    if (value === null || value === undefined || value === '') return '∅';
    if (Array.isArray(value)) return value.length ? value.join(', ') : '∅';
    return String(value);
  }

  /** The API sends UTC times without a zone: add the "Z" so the browser shows them in the local time zone. */
  utc(time: string): string { return time + 'Z'; }
}
