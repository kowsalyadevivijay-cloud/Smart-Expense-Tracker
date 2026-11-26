import { useState } from 'react';
import { Bar, BarChart, Cell, LabelList, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartColumn, ChartPie } from 'lucide-react';
import GlassCard from './GlassCard';
import ChartTooltip from './ChartTooltip';
import { EXPENSE_CATEGORIES, formatCompact, formatINR } from '../constants';

export default function CategoryBreakdown({ categoryTotals, selected, onSelect }) {
  const [view, setView] = useState('donut');
  const [balanced, setBalanced] = useState(true);

  const data = EXPENSE_CATEGORIES.map((category) => {
    return {
      name: category.name,
      value: categoryTotals[category.name] || 0,
      color: category.color,
    };
  });

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const nonZero = data.filter((item) => item.value > 0);

  const amounts = nonZero.map((item) => item.value);
  const isUneven = amounts.length > 1 && Math.max(...amounts) / Math.min(...amounts) > 15;
  const useBalanced = isUneven && balanced;

  function handleSelect(name) {

    if (selected === name) {
      onSelect('All');
    } else {
      onSelect(name);
    }
  }

  function getOpacity(name) {
    if (selected !== 'All' && selected !== name) {
      return 0.3;
    }
    return 1;
  }

  function getPercent(value) {
    if (total === 0) return 0;
    return (value / total) * 100;
  }

  const buttons = (
    <div className="flex items-center gap-2">
      {view === 'bar' && isUneven && (
        <button
          type="button"
          onClick={() => setBalanced(!balanced)}
          className="px-2 py-1 rounded-md text-[11px] border cursor-pointer t-muted"
          style={{ borderColor: balanced ? '#10B981' : 'var(--glass-border)' }}
        >
          Balanced scale: {balanced ? 'On' : 'Off'}
        </button>
      )}

      <button
        type="button"
        aria-label="Donut chart"
        onClick={() => setView('donut')}
        className={'p-1.5 rounded-md cursor-pointer ' + (view === 'donut' ? 'bg-emerald-500 text-white' : 't-muted')}
      >
        <ChartPie className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        aria-label="Bar chart"
        onClick={() => setView('bar')}
        className={'p-1.5 rounded-md cursor-pointer ' + (view === 'bar' ? 'bg-emerald-500 text-white' : 't-muted')}
      >
        <ChartColumn className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  return (
    <GlassCard id="analytics" title="Category Breakdown" action={buttons}>
      {total === 0 ? (
        <p className="t-muted text-sm py-16 text-center">No expenses yet.</p>
      ) : (
        <div className="relative h-52">
          <ResponsiveContainer width="100%" height="100%">
            {view === 'donut' ? (
              <PieChart>
                <Pie
                  data={nonZero}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={84}
                  minAngle={12}
                  paddingAngle={3}
                  stroke="none"
                  onClick={(slice) => handleSelect(slice.name)}
                >
                  {nonZero.map((item) => (
                    <Cell key={item.name} fill={item.color} fillOpacity={getOpacity(item.name)} style={{ cursor: 'pointer', outline: 'none' }} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip total={total} />} />
              </PieChart>
            ) : (
              <BarChart data={data} margin={{ top: 22, right: 8, left: 8, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide scale={useBalanced ? 'sqrt' : 'linear'} domain={[0, 'auto']} />
                <Tooltip content={<ChartTooltip total={total} />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
                <Bar dataKey="value" name="Spent" radius={[6, 6, 0, 0]} minPointSize={4} onClick={(bar) => handleSelect(bar.name)}>
                  {data.map((item) => (
                    <Cell key={item.name} fill={item.color} fillOpacity={getOpacity(item.name)} style={{ cursor: 'pointer' }} />
                  ))}
                  <LabelList dataKey="value" position="top" formatter={formatCompact} fill="#CBD5E1" fontSize={11} />
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>

          {view === 'donut' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] t-muted">Total spent</span>
              <span className="text-lg font-bold t-main" title={formatINR(total)}>{formatCompact(total)}</span>
            </div>
          )}
        </div>
      )}

      <ul className="mt-4 space-y-1.5">
        {data.map((item) => {
          const percent = getPercent(item.value);
          const isActive = selected === item.name;

          return (
            <li key={item.name}>
              <button
                type="button"
                onClick={() => handleSelect(item.name)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs cursor-pointer border"
                style={{ borderColor: isActive ? item.color : 'transparent', opacity: getOpacity(item.name) }}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                <span className="font-medium t-main w-16 text-left">{item.name}</span>
                <span className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--field)' }}>
                  <span className="block h-full rounded-full" style={{ width: (item.value ? Math.max(percent, 3) : 0) + '%', background: item.color }} />
                </span>
                <span className="t-muted w-12 text-right">{percent.toFixed(1)}%</span>
                <span className="font-semibold w-20 text-right" style={{ color: item.color }}>{formatCompact(item.value)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}
