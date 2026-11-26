import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import GlassCard from './GlassCard';
import ChartTooltip from './ChartTooltip';
import { formatCompact } from '../constants';

export default function CashflowChart({ series }) {
  const data = series.slice(-24);
  const axis = { tick: { fill: '#94A3B8', fontSize: 10 }, axisLine: false, tickLine: false };
  const yAxis = <YAxis {...axis} width={48} tickFormatter={formatCompact} />;

  return (
    <GlassCard title="Cashflow (Income vs Expense)">
      {data.length === 0 ? (
        <p className="t-muted text-sm py-16 text-center">Add entries to see the cashflow.</p>
      ) : (
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            {data.length < 2 ? (
              <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={8}>
                <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                <XAxis dataKey="label" {...axis} />
                {yAxis}
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
                <Bar dataKey="income" name="Income" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={56} />
                <Bar dataKey="expense" name="Expense" fill="#F43F5E" radius={[6, 6, 0, 0]} maxBarSize={56} />
              </BarChart>
            ) : (
              <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="cf-income" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.45} /><stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cf-expense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.45} /><stop offset="100%" stopColor="#F43F5E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                <XAxis dataKey="label" {...axis} minTickGap={18} />
                {yAxis}
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="income" name="Income" stroke="#10B981" strokeWidth={2.5} fill="url(#cf-income)" />
                <Area type="monotone" dataKey="expense" name="Expense" stroke="#F43F5E" strokeWidth={2.5} fill="url(#cf-expense)" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
      <div className="flex justify-center gap-5 mt-2 text-xs t-muted">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />Income</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" />Expense</span>
      </div>
    </GlassCard>
  );
}
