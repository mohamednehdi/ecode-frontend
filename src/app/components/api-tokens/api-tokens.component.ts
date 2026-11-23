import { Component, OnInit } from '@angular/core';
import { ApiToken, ApiTokenPayload, ApiTokenService } from '../../services/api-token.service';

interface TokenForm {
  name: string;
  is_active: boolean;
  ipsText: string;                 // one address or range per line (or separated by commas)
  allowed_types: string[];
  quota_hourly: number | null;
  quota_monthly: number | null;
  valid_from: string;              // yyyy-MM-dd or ''
  valid_until: string;             // yyyy-MM-dd or ''
}

const emptyForm = (): TokenForm => ({
  name: '', is_active: true, ipsText: '', allowed_types: [],
  quota_hourly: null, quota_monthly: null, valid_from: '', valid_until: ''
});

@Component({
  selector: 'app-api-tokens',
  templateUrl: './api-tokens.component.html',
  styleUrl: './api-tokens.component.css'
})
export class ApiTokensComponent implements OnInit {
  tokens: ApiToken[] = [];
  supportedTypes: string[] = [];

  loading = true;
  errorMessage = '';
  formError = '';
  saving = false;

  showForm = false;
  editingId: number | null = null;   // null = creating a new token
  form: TokenForm = emptyForm();

  newKey = '';                       // full key, shown once after creation or rotation
  newKeyName = '';
  newKeyVerb = 'créée';             // 'créée' or 'renouvelée'
  oldKeyUntil: string | null = null; // after a rotation: until when the previous key still works (UTC, no zone)
  copied = false;

  rotating: ApiToken | null = null;  // the key whose rotation panel is open
  graceHours = 24;
  rotateError = '';
  rotatingBusy = false;

  constructor(private api: ApiTokenService) { }

  ngOnInit(): void {
    this.load();
    this.api.supportedTypes().subscribe({
      next: types => this.supportedTypes = types,
      error: () => { /* the form still works without the list of types */ }
    });
  }

  load(): void {
    this.loading = true;
    this.api.list().subscribe({
      next: tokens => { this.tokens = tokens; this.loading = false; },
      error: err => {
        this.loading = false;
        this.errorMessage = err.error?.error || 'Impossible de charger les clés API.';
      }
    });
  }

  // ---- form ----

  openCreate(): void {
    this.editingId = null;
    this.form = emptyForm();
    this.formError = '';
    this.showForm = true;
  }

  openEdit(token: ApiToken): void {
    this.editingId = token.id;
    this.form = {
      name: token.name,
      is_active: token.is_active,
      ipsText: token.allowed_ips.join('\n'),
      allowed_types: [...token.allowed_types],
      quota_hourly: token.quota_hourly,
      quota_monthly: token.quota_monthly,
      valid_from: token.valid_from ? token.valid_from.substring(0, 10) : '',
      valid_until: token.valid_until ? token.valid_until.substring(0, 10) : ''
    };
    this.formError = '';
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
  }

  toggleType(type: string): void {
    const i = this.form.allowed_types.indexOf(type);
    if (i >= 0) this.form.allowed_types.splice(i, 1);
    else this.form.allowed_types.push(type);
  }

  save(): void {
    this.formError = '';
    if (!this.form.name.trim()) {
      this.formError = 'Le nom est obligatoire.';
      return;
    }
    const payload: ApiTokenPayload = {
      name: this.form.name.trim(),
      is_active: this.form.is_active,
      allowed_ips: this.form.ipsText.split(/[\s,;]+/).filter(ip => ip),
      allowed_types: this.form.allowed_types,
      // an empty number field gives null = unlimited
      quota_hourly: this.form.quota_hourly ?? null,
      quota_monthly: this.form.quota_monthly ?? null,
      valid_from: this.form.valid_from ? this.form.valid_from : null,
      // the last day is included: the key stops working at the end of that day (UTC)
      valid_until: this.form.valid_until ? this.form.valid_until + 'T23:59:59' : null
    };

    this.saving = true;
    if (this.editingId === null) {
      this.api.create(payload).subscribe({
        next: res => {
          this.saving = false;
          this.showForm = false;
          this.newKey = res.api_key;
          this.newKeyName = res.token.name;
          this.newKeyVerb = 'créée';
          this.oldKeyUntil = null;
          this.copied = false;
          this.load();
        },
        error: err => this.onSaveError(err)
      });
    } else {
      this.api.update(this.editingId, payload).subscribe({
        next: () => { this.saving = false; this.showForm = false; this.load(); },
        error: err => this.onSaveError(err)
      });
    }
  }

  private onSaveError(err: any): void {
    this.saving = false;
    this.formError = err.error?.error || "Erreur lors de l'enregistrement.";
  }

  // ---- row actions ----

  toggleActive(token: ApiToken): void {
    this.api.update(token.id, { is_active: !token.is_active }).subscribe({
      next: updated => this.tokens = this.tokens.map(t => t.id === updated.id ? updated : t),
      error: err => this.errorMessage = err.error?.error || 'Erreur lors de la modification.'
    });
  }

  remove(token: ApiToken): void {
    if (!confirm(`Supprimer la clé "${token.name}" ? Les applications qui l'utilisent seront refusées.`)) return;
    this.api.delete(token.id).subscribe({
      next: () => this.tokens = this.tokens.filter(t => t.id !== token.id),
      error: err => this.errorMessage = err.error?.error || 'Erreur lors de la suppression.'
    });
  }

  // ---- key rotation ----

  openRotate(token: ApiToken): void {
    this.rotating = token;
    this.graceHours = 24;
    this.rotateError = '';
  }

  closeRotate(): void {
    this.rotating = null;
  }

  confirmRotate(): void {
    if (!this.rotating) return;
    const hours = Number(this.graceHours);
    if (!Number.isFinite(hours) || hours < 0 || hours > 168) {
      this.rotateError = 'Le délai doit être compris entre 0 et 168 heures.';
      return;
    }
    this.rotatingBusy = true;
    this.rotateError = '';
    this.api.rotate(this.rotating.id, hours).subscribe({
      next: res => {
        this.rotatingBusy = false;
        this.rotating = null;
        this.newKey = res.api_key;
        this.newKeyName = res.token.name;
        this.newKeyVerb = 'renouvelée';
        this.oldKeyUntil = res.token.previous_key_valid_until;
        this.copied = false;
        this.load();
      },
      error: err => {
        this.rotatingBusy = false;
        this.rotateError = err.error?.error || 'Erreur lors du renouvellement.';
      }
    });
  }

  // ---- new key banner ----

  async copyKey(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.newKey);
      this.copied = true;
    } catch {
      this.copied = false;   // the key stays selectable in the box
    }
  }

  dismissKey(): void {
    this.newKey = '';
  }

  // ---- display helpers ----

  status(token: ApiToken): { label: string; css: string } {
    const now = Date.now();
    // the server sends UTC times without a "Z"
    if (!token.is_active) return { label: 'Désactivée', css: 'bg-secondary' };
    if (token.valid_until && new Date(token.valid_until + 'Z').getTime() < now) return { label: 'Expirée', css: 'bg-danger' };
    if (token.valid_from && new Date(token.valid_from + 'Z').getTime() > now) return { label: 'Pas encore valide', css: 'bg-warning text-dark' };
    return { label: 'Active', css: 'bg-success' };
  }

  asUtc(value: string | null): Date | null {
    return value ? new Date(value + 'Z') : null;
  }
}
