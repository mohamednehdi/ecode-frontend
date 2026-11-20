import { Component, Input } from '@angular/core';
import { CHART, niceTicks, shortNumber } from './chart-scale';

/**
 * One line over time (a null value is a gap), with an optional dashed reference line (e.g. the 95th percentile).
 * Plain SVG: no chart library. Each point has a text tooltip and a hover area larger than the marker.
 */
@Component({
  selector: 'app-line-chart',
  template: `
    <svg [attr.viewBox]="'0 0 ' + width + ' ' + height" class="chart" role="img" [attr.aria-label]="ariaLabel">
      <g *ngFor="let t of ticks">
        <line [attr.x1]="left" [attr.x2]="width - right" [attr.y1]="y(t)" [attr.y2]="y(t)" [attr.stroke]="colors.grid" stroke-width="1"/>
        <text [attr.x]="left - 6" [attr.y]="y(t) + 4" text-anchor="end" class="tick">{{ short(t) }}</text>
      </g>
      <line [attr.x1]="left" [attr.x2]="width - right" [attr.y1]="y(0)" [attr.y2]="y(0)" [attr.stroke]="colors.axis" stroke-width="1"/>

      <ng-container *ngIf="reference !== null">
        <line [attr.x1]="left" [attr.x2]="width - right" [attr.y1]="y(reference)" [attr.y2]="y(reference)"
              [attr.stroke]="colors.text" stroke-width="1.2" stroke-dasharray="5 4"/>
        <text [attr.x]="width - right - 2" [attr.y]="y(reference) - 5" text-anchor="end" class="tick strong">{{ referenceLabel }}</text>
      </ng-container>

      <path *ngFor="let d of paths" [attr.d]="d" fill="none" [attr.stroke]="color" stroke-width="2" stroke-linejoin="round"/>

      <g *ngFor="let p of points">
        <rect class="hover" [attr.x]="p.bandX" [attr.y]="top" [attr.width]="p.bandW" [attr.height]="innerH"><title>{{ p.tip }}</title></rect>
        <circle [attr.cx]="p.x" [attr.cy]="p.y" r="3" [attr.fill]="color" stroke="#fcfcfb" stroke-width="2" pointer-events="none"/>
      </g>

      <text *ngFor="let l of xLabels" [attr.x]="l.x" [attr.y]="height - 8" text-anchor="middle" class="tick">{{ l.text }}</text>
    </svg>`,
  styles: [`
    .chart { width: 100%; height: auto; display: block; }
    .tick { font-size: 11px; fill: #52514e; }
    .tick.strong { fill: #0b0b0b; font-weight: 600; }
    .hover { fill: transparent; }
    .hover:hover { fill: rgba(235, 104, 52, 0.08); }
  `]
})
export class LineChartComponent {
  @Input() labels: string[] = [];
  @Input() values: (number | null)[] = [];
  @Input() unit = 'ms';
  @Input() color = CHART.orange;
  @Input() reference: number | null = null;
  @Input() referenceLabel = '';
  @Input() ariaLabel = '';

  readonly width = 720; readonly height = 230;
  readonly left = 44; readonly right = 8; readonly top = 10; readonly bottom = 30;
  readonly colors = CHART;

  get innerW(): number { return this.width - this.left - this.right; }
  get innerH(): number { return this.height - this.top - this.bottom; }

  get ticks(): number[] {
    const highest = Math.max(0, this.reference ?? 0, ...this.values.map(v => v ?? 0));
    return niceTicks(highest);
  }
  private get topValue(): number { return this.ticks[this.ticks.length - 1]; }

  y(value: number): number { return this.top + this.innerH - (value / this.topValue) * this.innerH; }
  short(value: number): string { return shortNumber(value); }
  private x(i: number): number { return this.left + (i + 0.5) * (this.innerW / (this.labels.length || 1)); }

  get points() {
    const band = this.innerW / (this.labels.length || 1);
    return this.values
      .map((v, i) => v === null ? null : {
        x: this.x(i), y: this.y(v), bandX: this.left + i * band, bandW: band,
        tip: `${this.labels[i]} : ${v.toLocaleString('fr-FR')} ${this.unit}`,
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);
  }

  /** One path per run of consecutive values: a day without data breaks the line. */
  get paths(): string[] {
    const result: string[] = [];
    let current = '';
    this.values.forEach((v, i) => {
      if (v === null) { if (current) result.push(current); current = ''; return; }
      current += `${current ? 'L' : 'M'}${this.x(i).toFixed(1)},${this.y(v).toFixed(1)}`;
    });
    if (current) result.push(current);
    return result;
  }

  get xLabels() {
    const step = Math.max(1, Math.ceil(this.labels.length / 6));
    return this.labels.map((text, i) => ({ text, x: this.x(i) })).filter((_, i) => i % step === 0);
  }
}
