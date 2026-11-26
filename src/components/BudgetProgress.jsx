import { useState } from 'react';
import { Check, Pencil, TriangleAlert, X } from 'lucide-react';
import GlassCard from './GlassCard';
import { BUDGET_CATEGORIES, formatINR } from '../constants';

function getBarColor(percent) {
  if (percent > 90) return '#F43F5E';
  if (percent >= 75) return '#F59E0B';
  return '#10B981';
}

export default function BudgetProgress({ budgets, spent, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});

  function startEditing() {
    setDraft({ ...budgets });
    setEditing(true);
  }

  function saveBudgets() {
    const newBudgets = {};
    for (const category of BUDGET_CATEGORIES) {
      const value = parseFloat(draft[category]);

      newBudgets[category] = value > 0 ? value : budgets[category];
    }
    onChange(newBudgets);
    setEditing(false);
  }

  const buttons = editing ? (
    <div className="flex gap-1">
      <button type="button" onClick={saveBudgets} aria-label="Save budgets" className="p-1.5 rounded-lg bg-emerald-500 text-white cursor-pointer"><Check className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => setEditing(false)} aria-label="Cancel" className="p-1.5 rounded-lg btn-ghost cursor-pointer"><X className="w-3.5 h-3.5" /></button>
    </div>
  ) : (
    <button type="button" onClick={startEditing} aria-label="Edit budgets" className="p-1.5 rounded-lg btn-ghost cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
  );

  return (
    <GlassCard id="budgets" title="Monthly Budget Progress" action={buttons}>
      <div className="space-y-4">
        {BUDGET_CATEGORIES.map((category) => {
          const used = spent[category] || 0;
          const limit = budgets[category];
          const percent = limit ? (used / limit) * 100 : 0;
          const color = getBarColor(percent);
          const percentText = percent > 999 ? '999%+' : Math.round(percent) + '%';

          return (
            <div key={category}>
              <div className="flex items-center justify-between text-sm mb-1.5 gap-2">
                <span className="font-medium t-main">{category}</span>
                <span className="flex items-center gap-2 text-xs t-muted">
                  {percent > 90 && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-rose-300 bg-rose-500/15 border border-rose-500/40 font-semibold">
                      <TriangleAlert className="w-3 h-3" /> Warning
                    </span>
                  )}
                  {percentText}
                </span>
              </div>

              <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--field)' }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: Math.min(100, percent) + '%', background: color }} />
              </div>

              <div className="flex justify-between items-center text-xs t-muted mt-1">
                <span>{formatINR(used)} spent</span>
                {editing ? (
                  <label className="flex items-center gap-1">Limit ₹
                    <input type="number" min="1" className="field !w-24 !py-1 !px-2 text-xs" value={draft[category] ?? ''} onChange={(e) => setDraft({ ...draft, [category]: e.target.value })} />
                  </label>
                ) : (
                  <span>Limit: {formatINR(limit)}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
