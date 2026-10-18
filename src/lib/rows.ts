export type Rows = Record<string, string | number | boolean>[];

const counts = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

// a table's first column labels each row, the rest are numbers from 0 up
export function columns(component: string, title: string, data: Rows) {
  const [label, ...series] = Object.keys(data[0] ?? {});
  const values = data.flatMap((row) => series.map((name) => row[name]));
  if (!title || !series.length || !values.every(counts)) {
    throw new Error(
      `${component} "${title}" wants a title, and rows with a label then numbers from 0 up`,
    );
  }
  return { label, series, values, max: Math.max(...values) || 1 };
}

export const formatter =
  (unit = '') =>
  (value: number) =>
    `${value.toLocaleString('en-GB', { maximumFractionDigits: 2 })}${unit}`;

// about four gridlines, a round 1, 2 or 5 apart, topping out just above the data
export function scale(max: number) {
  const rough = max / 4;
  const power = 10 ** Math.floor(Math.log10(rough));
  const step = power * ([10, 5, 2].find((nice) => rough / power >= nice / Math.SQRT2) ?? 1);
  const top = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, index) => index * step);
  return { top, ticks };
}

// whole squares for each group, handing the leftovers to whoever lost most to rounding
export function shares(values: number[], squares: number) {
  const total = values.reduce((sum, value) => sum + value, 0) || 1;
  const exact = values.map((value) => (value / total) * squares);
  const whole = exact.map(Math.floor);
  const spare = squares - whole.reduce((sum, value) => sum + value, 0);
  exact
    .map((value, index) => ({ index, lost: value - whole[index] }))
    .sort((a, b) => b.lost - a.lost)
    .slice(0, spare)
    .forEach(({ index }) => whole[index]++);
  return whole;
}
