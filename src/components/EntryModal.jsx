import { useState } from 'react';
import Modal from './Modal';
import { ENTRY_EMOJIS, EXPENSE_CATEGORIES, INCOME_CATEGORIES, formatINR, getSmartEmoji } from '../constants';
import { withIdentity } from '../utils/entryUtils';
import { todayStr } from '../utils/dateUtils';

const MAX_AMOUNT = 10000000;
const ASK_ABOVE = 100000;

function ErrorText({ message }) {
  if (!message) return null;
  return <p className="text-xs text-rose-400 mt-1">{message}</p>;
}

export default function EntryModal({ initial, onSave, onClose }) {
  const startCategory = initial?.category || 'Food';
  const startNote = initial?.note || '';

  const [form, setForm] = useState({
    type: initial?.type || 'expense',
    amount: initial?.amount || '',
    category: startCategory,
    date: initial?.date || todayStr(),
    note: startNote,
    emoji: initial?.emoji || getSmartEmoji(startCategory, startNote),
  });
  const [emojiPicked, setEmojiPicked] = useState(Boolean(initial?.emoji));
  const [errors, setErrors] = useState({});

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function updateField(name, value) {
    const next = { ...form, [name]: value };
    if (!emojiPicked && (name === 'category' || name === 'note')) {
      next.emoji = getSmartEmoji(next.category, next.note);
    }
    setForm(next);
  }

  function changeType(newType) {
    const list = newType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const stillValid = list.some((c) => c.name === form.category);
    const nextCategory = stillValid ? form.category : list[0].name;

    setForm({
      ...form,
      type: newType,
      category: nextCategory,
      emoji: emojiPicked ? form.emoji : getSmartEmoji(nextCategory, form.note),
    });
  }

  function pickEmoji(emoji) {
    setEmojiPicked(true);
    setForm({ ...form, emoji });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const newErrors = {};
    const amount = parseFloat(form.amount);

    if (!form.amount || Number.isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Enter an amount greater than 0';
    } else if (amount > MAX_AMOUNT) {
      newErrors.amount = 'Amount is too large. Please check for extra zeros (max ₹1,00,00,000).';
    } else if (amount >= ASK_ABOVE && !window.confirm('Save a very large amount of ' + formatINR(amount) + '?')) {
      newErrors.amount = 'Please check the amount again.';
    }

    if (!form.date) {
      newErrors.date = 'Pick a date';
    }
    if (form.note.length > 80) {
      newErrors.note = 'Keep the note under 80 characters';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    onSave(withIdentity({
      type: form.type,
      amount: amount,
      category: form.category,
      date: form.date,
      note: form.note.trim() || form.category,
      emoji: form.emoji || getSmartEmoji(form.category, form.note),
      aiTagged: Boolean(initial?.aiTagged),
    }));
  }

  return (
    <Modal title={initial ? 'Review Entry' : 'Record Entry'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl" style={{ background: 'var(--field)' }}>
          {['expense', 'income'].map((type) => {
            let colorClass = 't-muted';
            if (form.type === type) {
              colorClass = type === 'income' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white';
            }
            return (
              <button key={type} type="button" onClick={() => changeType(type)} className={'py-2 rounded-lg text-sm font-semibold capitalize cursor-pointer transition ' + colorClass}>
                {type}
              </button>
            );
          })}
        </div>

        <div>
          <label className="text-xs t-muted mb-1 block" htmlFor="entry-amount">Amount (₹)</label>
          <input
            id="entry-amount"
            type="number"
            min="0"
            step="0.01"
            className="field"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => updateField('amount', e.target.value)}
          />
          <ErrorText message={errors.amount} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs t-muted mb-1 block" htmlFor="entry-category">Category</label>
            <select id="entry-category" className="field" value={form.category} onChange={(e) => updateField('category', e.target.value)}>
              {categories.map((c) => <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs t-muted mb-1 block" htmlFor="entry-date">Date</label>
            <input id="entry-date" type="date" className="field" value={form.date} onChange={(e) => updateField('date', e.target.value)} />
            <ErrorText message={errors.date} />
          </div>
        </div>

        <div>
          <label className="text-xs t-muted mb-1 block" htmlFor="entry-note">Note &amp; Emoji</label>
          <div className="flex gap-2">
            <span className="w-11 h-10 shrink-0 rounded-xl flex items-center justify-center text-xl border" style={{ background: 'var(--field)', borderColor: 'var(--glass-border)' }}>
              {form.emoji}
            </span>
            <input
              id="entry-note"
              className="field"
              placeholder="e.g. Dinner with friends"
              value={form.note}
              onChange={(e) => updateField('note', e.target.value)}
            />
          </div>
          <ErrorText message={errors.note} />

          <div className="flex flex-wrap gap-1.5 mt-2.5 p-2 rounded-xl border" style={{ background: 'var(--field)', borderColor: 'var(--glass-border)' }}>
            {ENTRY_EMOJIS.map((em) => {
              const activeClass = form.emoji === em ? 'bg-emerald-500/25 ring-1 ring-emerald-400 scale-110' : 'hover:bg-white/10';
              return (
                <button
                  key={em}
                  type="button"
                  onClick={() => pickEmoji(em)}
                  className={'w-7 h-7 rounded-lg text-base flex items-center justify-center cursor-pointer transition ' + activeClass}
                >
                  {em}
                </button>
              );
            })}
          </div>
        </div>

        <button type="submit" className="btn-emerald w-full py-2.5 rounded-xl font-semibold cursor-pointer">
          {form.emoji} {form.type === 'income' ? 'Add Income' : 'Add Expense'}
        </button>
      </form>
    </Modal>
  );
}
