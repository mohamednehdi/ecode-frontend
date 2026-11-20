import { Component, Input } from '@angular/core';
import { CHART, niceTicks, shortNumber } from './chart-scale';

export interface BarSeries { name: string; color: string; values: number[]; }

/**
 * Vertical bars, one per label, stacked from the bottom (the first series is at the bottom).
 * Plain SVG: no chart library. Every bar has a text tooltip (<title>) and a hover area larger than the bar.
 */
@Component({
  selector: 'app-bar-chart',
  template: `
    <svg [attr.viewBox]="'0 0 ' + width + ' ' + height" class="chart" role="img" [attr.aria-label]="ariaLabel">
      <g *ngFor="let t of ticks">
        <line [attr.x1]="left" [attr.x2]="width - right" [attr.y1]="y(t)" [attr.y2]="y(t)" [attr.stroke]="colors.grid" stroke-width="1"/>
        <text [attr.x]="left - 6" [attr.y]="y(t) + 4" text-anchor="end" class="tick">{{ short(t) }}</text>
      </g>
      <line [attr.x1]="left" [attr.x2]="width - right" [attr.y1]="y(0)" [attr.y2]="y(0)" [attr.stroke]="colors.axis" stroke-width="1"/>

      <g *ngFor="let bar of bars">
        <rect class="hover" [attr.x]="bar.bandX" [attr.y]="top" [attr.width]="bar.bandW" [attr.height]="innerH"><title>{{ bar.tip }}</title></rect>
        <rect *ngFor="let s of bar.segments" [attr.x]="bar.x" [attr.y]="s.y" [attr.width]="bar.w" [attr.height]="s.h"
              [attr.fill]="s.color" rx="1.5" pointer-events="none"/>
      </g>

      <text *ngFor="let l of xLabels" [attr.x]="l.x" [attr.y]="height - 8" text-anchor="middle" class="tick">{{ l.text }}</text>
    </svg>
    <div class="legend" *ngIf="series.length > 1">
      <span *ngFor="let s of series" class="legend-item"><i [style.background]="s.color"></i>{{ s.name }}</span>
    </div>`,
  styles: [`
    .chart { width: 100%; height: auto; display: block; }
    .tick { font-size: 11px; fill: #52514e; }
    .hover { fill: transparent; }
    .hover:hover { fill: rgba(42, 120, 214, 0.08); }
    .legend { display: flex; gap: 16px; justify-content: center; font-size: 12px; color: #52514e; margin-top: 4px; }
    .legend-item { display: inline-flex; align-items: center; gap: 6px; }
    .legend-item i { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }
  `]
})
export class BarChartComponent {
  @Input() labels: string[] = [];
  @Input() series: BarSeries[] = [];
  @Input() noun = 'requêtes';        // word used in the tooltips
  @Input() ariaLabel = '';

  readonly width = 720; readonly height = 250;
  readonly left = 44; readonly right = 8; readonly top = 10; readonly bottom = 30;
  readonly colors = CHART;

  get innerW(): number { return this.width - this.left - this.right; }
  get innerH(): number { return this.height - this.top - this.bottom; }

  private get totals(): number[] {
    return this.labels.map((_, i) => this.series.reduce((sum, s) => sum + (s.values[i] ?? 0), 0));
  }

  get ticks(): number[] { return niceTicks(Math.max(0, ...this.totals)); }
  private get topValue(): number { return this.ticks[this.ticks.length - 1]; }

  y(value: number): number { return this.top + this.innerH - (value / this.topValue) * this.innerH; }
  short(value: number): string { return shortNumber(value); }

  get bars() {
    const n = this.labels.length || 1;
    const band = this.innerW / n;
    const barW = Math.max(2, band * 0.64);
    return this.labels.map((label, i) => {
      let base = 0;
      const segments = this.series.map(s => {
        const value = s.values[i] ?? 0;
        const segment = { y: this.y(base + value), h: Math.max(0, this.y(base) - this.y(base + value)), color: s.color };
        base += value;
        return segment;
      }).filter(s => s.h > 0);
      const parts = this.series.map(s => `${(s.values[i] ?? 0).toLocaleString('fr-FR')} ${s.name.toLowerCase()}`).join(', ');
      return {
        bandX: this.left + i * band, bandW: band,
        x: this.left + i * band + (band - barW) / 2, w: barW,
        segments, tip: `${label} : ${parts}`,
      };
    });
  }

  /** About six labels on the x axis, always the first and a regular step. */
  get xLabels() {
    const n = this.labels.length;
    const step = Math.max(1, Math.ceil(n / 6));
    const band = this.innerW / (n || 1);
    return this.labels.map((text, i) => ({ text, x: this.left + i * band + band / 2 })).filter((_, i) => i % step === 0);
  }
}
