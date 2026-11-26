import { useState } from 'react';
import { CalendarClock, CheckCircle2, Plus, Power, Trash2 } from 'lucide-react';
import GlassCard from './GlassCard';
import { ENTRY_EMOJIS, EXPENSE_CATEGORIES, formatINR } from '../constants';
import { withIdentity } from '../utils/entryUtils';
import { todayStr } from '../utils/dateUtils';

export default function RecurringBills({ bills, onChange, onLogEntry }) {
  const [adding, setAdding] = useState(false);
  const [loggedId, setLoggedId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'Bills',
    emoji: '💡',
    dueDay: 10,
  });

  let activeTotal = 0;
  for (const bill of bills) {
    if (bill.active) {
      activeTotal += Number(bill.amount || 0);
    }
  }

  function addBill(event) {
    event.preventDefault();
    const amount = parseFloat(form.amount);
    if (!form.title.trim() || Number.isNaN(amount) || amount <= 0) return;

    const clampedDay = Math.min(28, Math.max(1, Number(form.dueDay) || 1));
    const newBill = {
      id: crypto.randomUUID(),
      title: form.title.trim(),
      amount: amount,
      category: form.category,
      emoji: form.emoji,
      dueDay: clampedDay,
      active: true,
    };

    onChange([newBill, ...bills]);
    setForm({ title: '', amount: '', category: 'Bills', emoji: '💡', dueDay: 10 });
    setAdding(false);
  }

  function toggleBill(id) {
    const updated = bills.map((bill) => (bill.id === id ? { ...bill, active: !bill.active } : bill));
    onChange(updated);
  }

  function removeBill(id) {
    onChange(bills.filter((bill) => bill.id !== id));
  }

  function logNow(bill) {
    onLogEntry(withIdentity({
      type: 'expense',
      amount: Number(bill.amount),
      category: bill.category,
      date: todayStr(),
      note: bill.title + ' (Recurring)',
      emoji: bill.emoji,
      aiTagged: false,
    }));
    setLoggedId(bill.id);
    setTimeout(() => setLoggedId(null), 1800);
  }

  const actionBtn = (
    <button type="button" onClick={() => setAdding(!adding)} className="btn-emerald inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer">
      <Plus className="w-3.5 h-3.5" />
      {adding ? 'Close' : 'Add Bill'}
    </button>
  );

  return (
    <GlassCard title={'Recurring Bills & Subscriptions (' + formatINR(activeTotal) + '/mo)'} action={actionBtn}>
      {adding && (
        <form onSubmit={addBill} className="mb-4 p-3.5 rounded-xl border space-y-3 fade-up" style={{ background: 'var(--field)', borderColor: 'var(--glass-border)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <input
              className="field"
              placeholder="Bill name (e.g. Netflix)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <input
              type="number"
              min="1"
              className="field"
              placeholder="Amount ₹"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
            <div className="flex gap-2">
              <select className="field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {EXPENSE_CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
              <input
                type="number"
                min="1"
                max="28"
                title="Due day of month"
                className="field !w-20"
                value={form.dueDay}
                onChange={(e) => setForm({ ...form, dueDay: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1">
              {ENTRY_EMOJIS.slice(0, 14).map((em) => {
                const selectedClass = form.emoji === em ? 'bg-emerald-500/25 ring-1 ring-emerald-400' : 'hover:bg-white/10';
                return (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setForm({ ...form, emoji: em })}
                    className={'w-7 h-7 rounded-lg text-sm cursor-pointer ' + selectedClass}
                  >
                    {em}
                  </button>
                );
              })}
            </div>
            <button type="submit" className="btn-emerald px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer">
              Save Bill
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2.5">
        {bills.map((bill) => {
          const rowOpacity = bill.active ? '' : 'opacity-50';
          const powerColor = bill.active ? 'text-emerald-400' : 't-muted';

          return (
            <div
              key={bill.id}
              className={'flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border transition ' + rowOpacity}
              style={{ background: 'var(--field)', borderColor: 'var(--glass-border)' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-lg shrink-0">
                  {bill.emoji}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold t-main truncate">{bill.title}</p>
                  <p className="text-xs t-muted flex items-center gap-1.5 mt-0.5">
                    <CalendarClock className="w-3 h-3 text-cyan-400" />
                    Due {bill.dueDay}th &bull; {bill.category}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-bold t-main tabular-nums mr-1">{formatINR(bill.amount)}</span>

                <button
                  type="button"
                  disabled={!bill.active}
                  onClick={() => logNow(bill)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/35 hover:bg-emerald-500/25 cursor-pointer disabled:opacity-40"
                >
                  {loggedId === bill.id ? <><CheckCircle2 className="w-3.5 h-3.5" /> Logged!</> : 'Log Now'}
                </button>

                <button type="button" onClick={() => toggleBill(bill.id)} title={bill.active ? 'Pause bill' : 'Activate bill'} className="p-1.5 rounded-lg btn-ghost cursor-pointer">
                  <Power className={'w-3.5 h-3.5 ' + powerColor} />
                </button>

                <button type="button" onClick={() => removeBill(bill.id)} title="Remove bill" className="p-1.5 rounded-lg t-muted hover:text-rose-400 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
