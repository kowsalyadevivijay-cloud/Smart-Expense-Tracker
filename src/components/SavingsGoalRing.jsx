import { useState } from 'react';
import { Check, Pencil } from 'lucide-react';
import GlassCard from './GlassCard';
import { formatINR } from '../constants';

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function SavingsGoalRing({ net, goal, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  let percent = 0;
  if (goal.target > 0) {
    percent = Math.max(0, Math.min(100, (net / goal.target) * 100));
  }

  function startEditing() {
    setDraft(String(goal.target));
    setEditing(true);
  }

  function saveGoal() {
    const value = parseFloat(draft);
    if (value > 0) {
      onChange({ target: value });
    }
    setEditing(false);
  }

  const actionButton = editing ? (
    <button type="button" onClick={saveGoal} aria-label="Save goal" className="p-1.5 rounded-lg bg-emerald-500 text-white cursor-pointer">
      <Check className="w-3.5 h-3.5" />
    </button>
  ) : (
    <button type="button" onClick={startEditing} aria-label="Edit goal" className="p-1.5 rounded-lg btn-ghost cursor-pointer">
      <Pencil className="w-3.5 h-3.5" />
    </button>
  );

  return (
    <GlassCard id="goals" title="Savings Goal" action={actionButton}>
      <div className="relative w-40 h-40 mx-auto">
        <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
          <defs>
            <linearGradient id="goal-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
          <circle cx="70" cy="70" r={RADIUS} fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth="12" />
          <circle
            cx="70"
            cy="70"
            r={RADIUS}
            fill="none"
            stroke="url(#goal-grad)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - percent / 100)}
            style={{ transition: 'stroke-dashoffset 0.8s ease', filter: 'drop-shadow(0 0 8px rgba(34,211,238,0.6))' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold t-main">{Math.round(percent)}%</span>
          <span className="text-xs t-muted">achieved</span>
        </div>
      </div>

      <div className="text-center mt-3 text-sm">
        {editing ? (
          <label className="inline-flex items-center gap-2 t-muted">
            Target ₹
            <input
              type="number"
              min="1"
              className="field !w-32 !py-1"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveGoal()}
            />
          </label>
        ) : (
          <p className="t-muted">
            <span className="font-semibold t-main">{formatINR(Math.max(0, net))}</span> of {formatINR(goal.target)}
          </p>
        )}
      </div>
    </GlassCard>
  );
}
