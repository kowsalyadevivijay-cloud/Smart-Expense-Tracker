import { formatINR } from '../constants';

export default function ChartTooltip({ active, payload, label, total }) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-xl border"
      style={{ background: 'var(--tooltip)', borderColor: 'var(--glass-border)' }}
    >
      {label && <p className="t-muted mb-1">{label}</p>}

      {payload.map((item) => {
        const color = item.color || item.payload.fill || item.payload.color;
        const name = item.name === 'value' ? 'Spent' : item.name;

        let percent = '';
        if (total > 0) {
          percent = ' (' + ((item.value / total) * 100).toFixed(1) + '%)';
        }

        return (
          <p key={item.name} className="font-semibold" style={{ color: color }}>
            {name}: {formatINR(item.value)}
            {percent}
          </p>
        );
      })}
    </div>
  );
}
