// Static, server-rendered chart primitives (no client JS / no charting
// library) — sufficient for the dashboard's read-only summaries and keeps
// the admin bundle minimal.

export function BarChart({
  data,
  valueFormatter = (v: number) => String(v),
}: {
  data: { label: string; value: number }[];
  valueFormatter?: (value: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex h-40 items-end gap-2">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1.5">
          <div className="flex w-full flex-1 items-end">
            <div
              className="bg-primary w-full rounded-t"
              style={{ height: `${Math.max((d.value / max) * 100, d.value > 0 ? 4 : 0)}%` }}
              title={valueFormatter(d.value)}
            />
          </div>
          <span className="text-muted text-[11px]">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function HorizontalBarList({
  items,
}: {
  items: { label: string; value: number; displayValue: string }[];
}) {
  const max = Math.max(...items.map((i) => i.value), 1);

  if (items.length === 0) {
    return <p className="text-muted py-6 text-center text-sm">No data yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-midnight font-medium">{item.label}</span>
            <span className="text-muted">{item.displayValue}</span>
          </div>
          <div className="bg-surface h-2 rounded-full">
            <div
              className="bg-accent h-2 rounded-full"
              style={{ width: `${Math.max((item.value / max) * 100, 2)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
