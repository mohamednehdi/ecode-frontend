import { Component, Input } from '@angular/core';
import { CHART } from './chart-scale';

export interface BarRow { label: string; value: number; note?: string; color?: string; }

/**
 * Horizontal bars with the value written at the end of each row (a ranking, a breakdown).
 * Plain HTML (not SVG) so the text keeps its real size whatever the width of the card.
 */
@Component({
  selector: 'app-hbar-chart',
  template: `
    <div class="rows" role="img" [attr.aria-label]="ariaLabel">
      <div class="row-item" *ngFor="let row of layout" [attr.title]="row.tip">
        <span class="label">{{ row.label }}</span>
        <span class="track"><span class="bar" [style.width.%]="row.percent" [style.background]="row.color"></span></span>
        <span class="value">{{ row.text }}</span>
      </div>
    </div>`,
  styles: [`
    .rows { display: flex; flex-direction: column; gap: 4px; }
    .row-item { display: grid; grid-template-columns: minmax(80px, 38%) 1fr auto; align-items: center; gap: 10px;
                padding: 4px 6px; border-radius: 6px; font-size: 13px; }
    .row-item:hover { background: rgba(42, 120, 214, 0.07); }
    .label { color: #0b0b0b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: right; }
    .track { display: block; height: 14px; }
    .bar { display: block; height: 100%; border-radius: 2px; min-width: 2px; }
    .value { color: #52514e; white-space: nowrap; min-width: 40px; }
  `]
})
export class HBarChartComponent {
  @Input() rows: BarRow[] = [];
  @Input() ariaLabel = '';

  get layout() {
    const max = Math.max(1, ...this.rows.map(r => r.value));
    return this.rows.map(r => ({
      label: r.label,
      percent: r.value > 0 ? Math.max(1.5, (r.value / max) * 100) : 0,
      text: r.value.toLocaleString('fr-FR') + (r.note ? ` · ${r.note}` : ''),
      color: r.color ?? CHART.blue,
      tip: `${r.label} : ${r.value.toLocaleString('fr-FR')}${r.note ? ' (' + r.note + ')' : ''}`,
    }));
  }
}
