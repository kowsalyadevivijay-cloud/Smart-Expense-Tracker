import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';
import { formatCurrency } from '../constants';
import { spotlightMove, spotlightTouchEnd, spotlightTouchStart } from '../utils/spotlight';

function Sparkline({ data, color, id }) {

  let points = data;
  if (data.length < 2) {
    points = [{ value: 0 }, { value: data.length ? data[0].value : 0 }];
  }

  return (
    <div className="h-14 w-full mt-3">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.5} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={'url(#' + id + ')'} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, color, glow, data, id, valueClass, index }) {
  return (
    <div onMouseMove={spotlightMove} onTouchStart={spotlightTouchStart} onTouchMove={spotlightMove} onTouchEnd={spotlightTouchEnd} onTouchCancel={spotlightTouchEnd} style={{ '--i': index }} className={'glass spotlight reveal p-5 hover:shadow-2xl ' + glow}>
      <div className="flex items-center justify-between">
        <p className="text-sm t-muted font-medium">{label}</p>
        <span className="p-2 rounded-xl" style={{ background: color + '22', color: color }}>
          <Icon className="w-4 h-4" />
        </span>
      </div>
      <p className={'text-2xl sm:text-3xl font-bold mt-2 tracking-tight ' + valueClass}>{value}</p>
      <Sparkline data={data} color={color} id={id} />
    </div>
  );
}

export default function KpiCards({ totals, series }) {
  const netData = series.map((item) => ({ value: item.cumNet }));
  const incomeData = series.map((item) => ({ value: item.cumIncome }));
  const expenseData = series.map((item) => ({ value: item.cumExpense }));

  return (
    <div id="dashboard" className="grid grid-cols-1 md:grid-cols-3 gap-5 scroll-mt-24">
      <KpiCard index={0} label="Net Balance" value={formatCurrency(totals.net)} icon={Wallet} color="#10B981" glow="glow-neutral" id="spark-net" data={netData} valueClass="t-main" />
      <KpiCard index={1} label="Total Income" value={'+' + formatCurrency(totals.income)} icon={ArrowUpRight} color="#10B981" glow="glow-emerald" id="spark-income" data={incomeData} valueClass="text-emerald-400" />
      <KpiCard index={2} label="Total Expenses" value={'-' + formatCurrency(totals.expense)} icon={ArrowDownRight} color="#F43F5E" glow="glow-rose" id="spark-expense" data={expenseData} valueClass="text-rose-400" />
    </div>
  );
}
