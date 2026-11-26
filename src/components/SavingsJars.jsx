import { useState } from 'react';
import { Plus, Sparkles, Trash2 } from 'lucide-react';
import GlassCard from './GlassCard';
import { AVATAR_EMOJIS, formatINR } from '../constants';

const JAR_COLORS = ['#10B981', '#22D3EE', '#8B5CF6', '#F59E0B', '#F43F5E'];

export default function SavingsJars({ jars, onChange }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', emoji: '🎯', target: '', saved: '' });

  function addJar(event) {
    event.preventDefault();
    const target = parseFloat(form.target);
    const saved = parseFloat(form.saved) || 0;
    if (!form.name.trim() || Number.isNaN(target) || target <= 0) return;

    const newJar = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      emoji: form.emoji,
      target: target,
      saved: saved,
      color: JAR_COLORS[jars.length % JAR_COLORS.length],
    };

    onChange([...jars, newJar]);
    setForm({ name: '', emoji: '🎯', target: '', saved: '' });
    setAdding(false);
  }

  function addAmountToJar(id, delta) {
    const updated = jars.map((jar) => {
      if (jar.id !== id) return jar;
      return { ...jar, saved: Math.max(0, Number(jar.saved || 0) + delta) };
    });
    onChange(updated);
  }

  function removeJar(id) {
    onChange(jars.filter((jar) => jar.id !== id));
  }

  const actionBtn = (
    <button type="button" onClick={() => setAdding(!adding)} className="btn-emerald inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer">
      <Plus className="w-3.5 h-3.5" />
      {adding ? 'Close' : 'New Jar'}
    </button>
  );

  return (
    <GlassCard title="Emoji Savings Jars & Wishlist Goals" action={actionBtn}>
      {adding && (
        <form onSubmit={addJar} className="mb-4 p-3.5 rounded-xl border space-y-3 fade-up" style={{ background: 'var(--field)', borderColor: 'var(--glass-border)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <input
              className="field"
              placeholder="Goal name (e.g. Dream Bike)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="number"
              min="1"
              className="field"
              placeholder="Target ₹"
              value={form.target}
              onChange={(e) => setForm({ ...form, target: e.target.value })}
            />
            <input
              type="number"
              min="0"
              className="field"
              placeholder="Already saved ₹"
              value={form.saved}
              onChange={(e) => setForm({ ...form, saved: e.target.value })}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1">
              {AVATAR_EMOJIS.slice(0, 14).map((em) => {
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
              Create Jar
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {jars.map((jar) => {
          const percent = jar.target > 0 ? Math.min(100, Math.round((jar.saved / jar.target) * 100)) : 0;
          const completed = percent >= 100;
          const borderColor = completed ? 'rgba(16,185,129,0.5)' : 'var(--glass-border)';
          const statusText = completed ? '🎉 Goal Achieved!' : formatINR(Math.max(0, jar.target - jar.saved)) + ' to go';

          return (
            <div
              key={jar.id}
              className="p-4 rounded-xl border space-y-3 transition"
              style={{ background: 'var(--field)', borderColor: borderColor }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: jar.color + '22' }}>
                    {jar.emoji}
                  </span>
                  <div>
                    <p className="text-sm font-bold t-main flex items-center gap-1.5">
                      {jar.name}
                      {completed && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                    </p>
                    <p className="text-xs t-muted tabular-nums">
                      {formatINR(jar.saved)} / {formatINR(jar.target)} ({percent}%)
                    </p>
                  </div>
                </div>
                <button type="button" onClick={() => removeJar(jar.id)} aria-label={'Delete ' + jar.name} className="p-1 rounded-lg t-muted hover:text-rose-400 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="h-2.5 rounded-full overflow-hidden bg-black/20">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: percent + '%', background: jar.color, boxShadow: '0 0 10px ' + jar.color }} />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[11px] font-medium text-emerald-400">{statusText}</span>
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => addAmountToJar(jar.id, 1000)} className="px-2.5 py-1 rounded-lg text-xs font-semibold btn-ghost hover:text-emerald-400 cursor-pointer">+₹1k</button>
                  <button type="button" onClick={() => addAmountToJar(jar.id, 5000)} className="px-2.5 py-1 rounded-lg text-xs font-semibold btn-ghost hover:text-emerald-400 cursor-pointer">+₹5k</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
