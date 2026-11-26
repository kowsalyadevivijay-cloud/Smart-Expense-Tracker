import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  CheckCircle2,
  Lightbulb,
  RotateCcw,
  ScanLine,
  Send,
  Sparkles,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Undo2,
  User,
} from 'lucide-react';
import GlassCard from './GlassCard';
import { formatINR } from '../constants';
import { withIdentity } from '../utils/entryUtils';
import {
  answerQuestion,
  generateInsights,
  isQuestion,
  matchConversation,
  parseTransaction,
} from '../utils/aiParser';

const SUGGESTIONS = [
  'Summary',
  'How much did I spend on Food?',
  'Daily safe spend?',
  'Biggest expense?',
];

export default function CopilotCard({ entries, budgets, goal, onAddEntry, onDeleteEntry, onScan }) {
  const insights = useMemo(() => generateInsights(entries, budgets), [entries, budgets]);
  const [input, setInput] = useState('');
  const feedRef = useRef(null);
  const inputRef = useRef(null);

  function createWelcomeMessages() {
    const tips = insights.tips.slice(0, 2).map((tip) => ({ role: 'ai', isTip: true, text: tip }));
    return [
      {
        role: 'ai',
        text: 'Vanakkam! Say "Hi", ask a question like "Summary", or type "Spent ₹450 on dinner" to log an entry.',
      },
      ...tips,
    ];
  }

  const [messages, setMessages] = useState(createWelcomeMessages);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages]);

  function addMessages(...newMessages) {
    setMessages((old) => [...old, ...newMessages]);
  }

  function handleUndo(entryId, note) {
    if (!onDeleteEntry || !entryId) return;
    onDeleteEntry(entryId);
    setMessages((old) =>
      old.map((m) => (m.logged?.id === entryId ? { ...m, undone: true } : m))
    );
    addMessages({
      role: 'ai',
      text: 'Removed "' + note + '" from your ledger.',
    });
  }

  function handleText(rawText) {
    const text = rawText.trim();
    if (text === '') return;

    const userMessage = { role: 'user', text: text };

    if (/^undo$/i.test(text) && onDeleteEntry) {
      const lastLogged = [...messages].reverse().find((m) => m.logged && !m.undone);
      if (lastLogged) {
        addMessages(userMessage);
        handleUndo(lastLogged.logged.id, lastLogged.logged.note);
        return;
      }
    }

    const chatReply = matchConversation(text, entries);
    if (chatReply) {
      addMessages(userMessage, { role: 'ai', text: chatReply });
      return;
    }

    if (isQuestion(text)) {
      const answer = answerQuestion(text, entries, { budgets: budgets, goal: goal });
      addMessages(userMessage, { role: 'ai', text: answer });
      return;
    }

    const result = parseTransaction(text);
    if (!result.ok) {
      addMessages(userMessage, {
        role: 'ai',
        text: 'I could not find an amount in that. Try "Spent ₹450 on dinner" or ask "What can you do?".',
      });
      return;
    }

    const savedEntry = withIdentity(result.entry);
    onAddEntry(savedEntry);
    addMessages(userMessage, {
      role: 'ai',
      logged: {
        id: savedEntry.id,
        type: savedEntry.type,
        amount: savedEntry.amount,
        category: savedEntry.category,
        note: savedEntry.note,
        emoji: savedEntry.emoji || '✨',
      },
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    handleText(input);
    setInput('');
  }

  function handleReset() {
    setMessages(createWelcomeMessages());
    inputRef.current?.focus();
  }

  const savingsPositive = insights.projectedSavings >= 0;
  const spikeChip = insights.chips.find((c) => c.tone === 'warn' && c.text.includes('spend up'));

  const topSpendText = insights.topCategory
    ? insights.topCategory.name + ' · ' + formatINR(insights.topCategory.amount)
    : 'No expenses yet';

  const savingsAccent = savingsPositive
    ? 'border-emerald-500/25 bg-emerald-500/[0.04]'
    : 'border-rose-500/25 bg-rose-500/[0.04]';
  const savingsText = savingsPositive
    ? 'text-emerald-700 dark:text-emerald-300'
    : 'text-rose-700 dark:text-rose-300';
  const savingsIconBg = savingsPositive
    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
    : 'bg-rose-500/15 text-rose-600 dark:text-rose-300';

  return (
    <GlassCard
      id="copilot"
      className="glow-emerald flex flex-col"
      bodyClassName="flex-1 flex flex-col justify-between gap-4"
    >
      <div
        className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b"
        style={{ borderColor: 'var(--glass-border)' }}
      >
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-[0_4px_16px_rgba(16,185,129,0.35)]">
            <Sparkles className="w-4 h-4" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold t-main tracking-tight">Kanakku AI</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                கணக்கு AI
              </span>
            </div>
            <p className="text-[11px] t-muted mt-0.5">Conversational ledger &amp; instant spending insights</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 3 && (
            <button
              type="button"
              onClick={handleReset}
              title="Reset conversation"
              className="btn-ghost inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium t-muted hover:text-emerald-600 dark:hover:text-emerald-300 cursor-pointer active:scale-95 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
          <button
            type="button"
            onClick={onScan}
            className="btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold hover:border-emerald-500/50 cursor-pointer active:scale-95 transition"
          >
            <ScanLine className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Scan Receipt</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="group flex items-center justify-between px-4 py-3 rounded-xl border border-cyan-500/25 bg-cyan-500/[0.04] transition-all duration-200">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider t-muted">Top Spend Category</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">{topSpendText}</p>
          </div>
          <span className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 transition-transform duration-200 group-hover:scale-105">
            <TrendingUp className="w-4 h-4" />
          </span>
        </div>

        <div className={'group flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 ' + savingsAccent}>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider t-muted">Projected Monthly Savings</p>
            <p className={'text-sm font-bold mt-0.5 tabular-nums ' + savingsText}>
              {savingsPositive ? '+' : ''}{formatINR(insights.projectedSavings)}
            </p>
          </div>
          <span className={'p-2.5 rounded-xl transition-transform duration-200 group-hover:scale-105 ' + savingsIconBg}>
            {savingsPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </span>
        </div>
      </div>

      {spikeChip && (
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30">
          <TriangleAlert className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{spikeChip.text}</span>
        </div>
      )}

      <div
        ref={feedRef}
        className="flex-1 min-h-[185px] max-h-[265px] overflow-y-auto space-y-3 p-3.5 rounded-xl border"
        style={{ background: 'var(--field)', borderColor: 'var(--glass-border)' }}
      >
        {messages.map((message, index) => {
          const isUser = message.role === 'user';

          if (isUser) {
            return (
              <div key={index} className="flex items-start justify-end gap-2.5 fade-up">
                <div className="text-xs sm:text-[13px] leading-relaxed rounded-2xl rounded-tr-sm px-3.5 py-2.5 max-w-[82%] bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-medium shadow-sm">
                  {message.text}
                </div>
                <span className="mt-0.5 p-1.5 h-fit rounded-lg btn-ghost shrink-0">
                  <User className="w-3.5 h-3.5" />
                </span>
              </div>
            );
          }

          if (message.logged) {
            const isIncome = message.logged.type === 'income';
            const badgeTone = isIncome
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30';

            return (
              <div key={index} className="flex items-start gap-2.5 fade-up">
                <span className="mt-0.5 p-1.5 h-fit rounded-lg shrink-0 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
                <div className={'text-xs sm:text-[13px] rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[85%] bg-white/90 dark:bg-slate-900/80 border border-emerald-500/30 t-main shadow-xs space-y-1.5 ' + (message.undone ? 'opacity-60' : '')}>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={'font-semibold ' + (message.undone ? 'line-through' : '')}>
                      {message.logged.emoji} {message.logged.note}
                    </span>
                    <span className={'text-[10px] font-bold px-2 py-0.5 rounded-full border ' + badgeTone}>
                      {isIncome ? '+' : '-'}{formatINR(message.logged.amount)} · {message.logged.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] t-muted">
                      {message.undone ? 'Entry undone.' : 'Saved to your ledger.'}
                    </p>
                    {onDeleteEntry && !message.undone && (
                      <button
                        type="button"
                        onClick={() => handleUndo(message.logged.id, message.logged.note)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                      >
                        <Undo2 className="w-3 h-3" />
                        Undo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          const iconWrapClass = message.isTip
            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300'
            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400';

          const cardClass = message.isTip
            ? 'bg-amber-500/[0.06] dark:bg-amber-500/[0.08] border-amber-500/25'
            : 'bg-white/90 dark:bg-slate-900/75 border-slate-200/80 dark:border-slate-800';

          return (
            <div key={index} className="flex items-start gap-2.5 fade-up">
              <span className={'mt-0.5 p-1.5 h-fit rounded-lg shrink-0 ' + iconWrapClass}>
                {message.isTip ? <Lightbulb className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </span>
              <div className={'text-xs sm:text-[13px] leading-relaxed whitespace-pre-line rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[85%] border t-main shadow-xs ' + cardClass}>
                {message.isTip && (
                  <span className="inline-block mr-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-amber-500/15 text-amber-700 dark:text-amber-300">
                    Insight
                  </span>
                )}
                <span>{message.text}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2.5 pt-0.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {SUGGESTIONS.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => handleText(question)}
              className="text-[11px] font-medium px-3 py-1 rounded-full btn-ghost text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-300 hover:border-emerald-500/40 cursor-pointer active:scale-95 transition"
            >
              {question}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 p-1.5 rounded-xl border transition-all focus-within:border-emerald-500/60 focus-within:ring-2 focus-within:ring-emerald-500/15"
          style={{ background: 'var(--field)', borderColor: 'var(--glass-border)' }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Say "Hi", ask "Summary", or type "Spent ₹450 on dinner"'
            aria-label="Ask Kanakku AI"
            className="w-full bg-transparent px-2.5 py-1.5 text-sm t-main outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            aria-label="Send to Kanakku AI"
            className="btn-emerald px-4 py-2 rounded-lg cursor-pointer shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold disabled:opacity-45 disabled:cursor-not-allowed active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </GlassCard>
  );
}