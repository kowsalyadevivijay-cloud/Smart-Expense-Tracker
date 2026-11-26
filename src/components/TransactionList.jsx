import { ArrowDownRight, ArrowUpRight, Trash2 } from 'lucide-react';
import GlassCard from './GlassCard';
import { formatCurrency, getCategoryColor, getSmartEmoji } from '../constants';
import { formatLongDate } from '../utils/dateUtils';

function TransactionRow({ entry, onDelete }) {
  const isIncome = entry.type === 'income';
  const color = getCategoryColor(entry.category);
  const emoji = entry.emoji || getSmartEmoji(entry.category, entry.note);
  const label = entry.aiTagged ? entry.category + ' - AI Tagged' : entry.category;

  const boxBg = isIncome ? 'bg-emerald-500/15' : 'bg-rose-500/15';
  const badgeBg = isIncome ? 'bg-emerald-500' : 'bg-rose-500';
  const amountColor = isIncome ? 'text-emerald-400' : 'text-rose-400';

  return (
    <li className="flex items-center gap-3 py-3 border-b last:border-b-0" style={{ borderColor: 'var(--glass-border)' }}>
      <span className={'relative w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-lg ' + boxBg}>
        {emoji}
        <span className={'absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white ' + badgeBg}>
          {isIncome ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
        </span>
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium t-main truncate">{entry.note}</p>
        <span className="inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-md border" style={{ color: color, background: color + '1A', borderColor: color + '40' }}>
          {label}
        </span>
      </div>

      <p className={'text-sm font-semibold tabular-nums ' + amountColor}>
        {isIncome ? '+' : '-'}{formatCurrency(entry.amount)}
      </p>

      <button type="button" onClick={() => onDelete(entry.id)} aria-label={'Delete ' + entry.note} className="p-1.5 rounded-lg t-muted hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer">
        <Trash2 className="w-4 h-4" />
      </button>
    </li>
  );
}

function groupByDate(entries) {
  const groups = [];

  for (const entry of entries) {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.date === entry.date) {
      lastGroup.items.push(entry);
    } else {
      groups.push({ date: entry.date, items: [entry] });
    }
  }
  return groups;
}

export default function TransactionList({ entries, sortBy = 'recent', onDelete, title, action, maxHeight = 'max-h-[30rem]' }) {
  let content;

  if (entries.length === 0) {
    content = <p className="text-sm t-muted text-center py-10">No transactions match your filters.</p>;
  } else if (sortBy === 'recent') {
    content = groupByDate(entries).map((group) => (
      <div key={group.date} className="mb-2">
        <p className="text-xs font-semibold t-muted uppercase tracking-wider mt-2">{formatLongDate(group.date)}</p>
        <ul>
          {group.items.map((entry) => <TransactionRow key={entry.id} entry={entry} onDelete={onDelete} />)}
        </ul>
      </div>
    ));
  } else {
    content = (
      <ul>
        {entries.map((entry) => (
          <div key={entry.id}>
            <TransactionRow entry={entry} onDelete={onDelete} />
            <p className="text-[11px] t-muted -mt-2 pb-2 pl-13">{formatLongDate(entry.date)}</p>
          </div>
        ))}
      </ul>
    );
  }

  return (
    <GlassCard id="transactions" title={title ?? 'Transactions (' + entries.length + ')'} action={action}>
      <div className={maxHeight + ' overflow-y-auto pr-1'}>{content}</div>
    </GlassCard>
  );
}
