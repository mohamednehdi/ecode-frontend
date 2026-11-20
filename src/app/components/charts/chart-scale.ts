/** Round numbers for a chart axis: ticks 0, step, 2*step ... up to the first one that holds `max`. */
export function niceTicks(max: number, wanted = 4): number[] {
  if (!isFinite(max) || max <= 0) return [0, 1];
  const rough = max / wanted;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rough)));
  const step = [1, 2, 5, 10].map(m => m * magnitude).find(s => s >= rough) ?? 10 * magnitude;
  const ticks: number[] = [];
  for (let value = 0; value < max + step * 0.999; value += step) {
    ticks.push(Math.round(value * 1e6) / 1e6);
    if (value >= max) break;
  }
  return ticks;
}

/** 12 500 -> "12,5 k": short labels for axis ticks. */
export function shortNumber(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' M';
  if (value >= 1_000) return (value / 1_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' k';
  return value.toLocaleString('fr-FR', { maximumFractionDigits: 1 });
}

// Chart colours (reference palette, light surface): one blue for volumes, orange for time, red for errors
export const CHART = {
  blue: '#2a78d6',
  orange: '#eb6834',
  red: '#d03b3b',
  grid: '#e1e0d9',
  axis: '#c3c2b7',
  text: '#52514e',
  textStrong: '#0b0b0b',
};
