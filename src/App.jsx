import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Download, Plus, ScanLine, Sparkles, UserCog } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KpiCards from './components/KpiCards';
import CopilotCard from './components/CopilotCard';
import CategoryBreakdown from './components/CategoryBreakdown';
import CashflowChart from './components/CashflowChart';
import BudgetProgress from './components/BudgetProgress';
import SavingsGoalRing from './components/SavingsGoalRing';
import SavingsJars from './components/SavingsJars';
import RecurringBills from './components/RecurringBills';
import ProfileStudio from './components/ProfileStudio';
import FilterBar from './components/FilterBar';
import TransactionList from './components/TransactionList';
import EntryModal from './components/EntryModal';
import ReceiptScannerModal from './components/ReceiptScannerModal';
import ExportModal from './components/ExportModal';
import CursorGlow from './components/CursorGlow';
import GlassCard from './components/GlassCard';
import useLocalStorage from './hooks/useLocalStorage';
import {
  DEFAULT_BUDGETS,
  DEFAULT_GOAL,
  DEFAULT_JARS,
  DEFAULT_PROFILE,
  DEFAULT_RECURRING,
  GIF_STICKERS,
  formatINR,
} from './constants';

import { buildSeries } from './utils/chartData';
import { monthlySpendByCategory, summarise } from './utils/aiParser';

const INITIAL_FILTERS = {
  search: '',
  type: 'all',
  category: 'All',
  startDate: '',
  endDate: '',
  minAmount: '',
  maxAmount: '',
  sortBy: 'recent',
};

const QUICK_LINKS = [
  ['budgets', '💡 Budgets & Bills'],
  ['goals', '🎯 Emoji Jars'],
  ['analytics', '📊 Deep Analytics'],
  ['profile', '🎨 GIF Studio'],
];

export default function App() {

  const [entries, setEntries] = useLocalStorage('sxt_entries',[]);
  const [budgets, setBudgets] = useLocalStorage('sxt_budgets', DEFAULT_BUDGETS);
  const [goal, setGoal] = useLocalStorage('sxt_goal', DEFAULT_GOAL);
  const [jars, setJars] = useLocalStorage('sxt_jars', DEFAULT_JARS);
  const [recurring, setRecurring] = useLocalStorage('sxt_recurring', DEFAULT_RECURRING);
  const [profile, setProfile] = useLocalStorage('sxt_profile', DEFAULT_PROFILE);
  const [theme, setTheme] = useLocalStorage('sxt_theme', 'dark');

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [entryModal, setEntryModal] = useState(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState('dashboard');

  const darkMode = theme === 'dark';
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  function addEntry(entry) {
    setEntries((prev) => [entry, ...prev]);
  }

  function deleteEntry(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  const hasDemo = entries.some((e) => e.demo);
  function clearDemo() {
    if (window.confirm('Remove all demo entries? Your own entries will be kept.')) {
      setEntries((prev) => prev.filter((e) => !e.demo));
    }
  }

  function navigate(pageId) {
    setActive(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function selectCategoryAndOpenList(category) {
    setFilters({ ...filters, category });
    navigate('transactions');
  }

  const totals = useMemo(() => summarise(entries), [entries]);
  const series = useMemo(() => buildSeries(entries), [entries]);
  const spent = useMemo(() => monthlySpendByCategory(entries), [entries]);

  const filtered = useMemo(() => {
    const searchText = filters.search.trim().toLowerCase();
    const minAmount = filters.minAmount === '' ? null : parseFloat(filters.minAmount);
    const maxAmount = filters.maxAmount === '' ? null : parseFloat(filters.maxAmount);

    const result = entries.filter((entry) => {
      if (filters.type !== 'all' && entry.type !== filters.type) return false;
      if (filters.category !== 'All' && entry.category !== filters.category) return false;
      if (filters.startDate && entry.date < filters.startDate) return false;
      if (filters.endDate && entry.date > filters.endDate) return false;
      if (minAmount !== null && entry.amount < minAmount) return false;
      if (maxAmount !== null && entry.amount > maxAmount) return false;

      if (searchText) {
        const inNote = entry.note.toLowerCase().includes(searchText);
        const inCategory = entry.category.toLowerCase().includes(searchText);
        if (!inNote && !inCategory) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      if (filters.sortBy === 'highest') {
        return b.amount - a.amount;
      }
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    return result;
  }, [entries, filters]);

  const activeGif = useMemo(() => {
    if (profile.gifMode && profile.gifMode !== 'auto') {
      return GIF_STICKERS.find((g) => g.id === profile.gifMode) || GIF_STICKERS[0];
    }

    const savingsRate = totals.income > 0 ? (totals.net / totals.income) * 100 : 0;
    const overBudget = Object.entries(budgets).some(([cat, limit]) => limit > 0 && (spent[cat] || 0) / limit > 0.9);

    if (overBudget) return { src: '/gifs/alert-pulse.gif', label: 'Budget Watch Active' };
    if (savingsRate >= 35) return { src: '/gifs/rocket-wealth.gif', label: 'Wealth Rocket Mode' };
    if (savingsRate >= 15) return { src: '/gifs/coin-party.gif', label: 'Savings Streak On' };
    return { src: '/gifs/fire-streak.gif', label: 'Daily Ledger Streak' };
  }, [profile.gifMode, totals, budgets, spent]);

  const savingsRatePct = totals.income > 0 ? Math.max(0, Math.round((totals.net / totals.income) * 100)) : 0;

  return (
    <div className="app-canvas min-h-screen flex">
      <CursorGlow />
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        active={active}
        onNavigate={navigate}
        hasDemo={hasDemo}
        onClearDemo={clearDemo}
        onExport={() => setExportOpen(true)}
        profile={profile}
        entryCount={entries.length}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header
          darkMode={darkMode}
          onToggleTheme={() => setTheme(darkMode ? 'light' : 'dark')}
          onRecord={() => setEntryModal({})}
          onExport={() => setExportOpen(true)}
          activePage={active}
          onNavigate={navigate}
          profile={profile}
        />

        <main className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-5 flex-1">
          {active === 'dashboard' && (
            <div className="space-y-5">
              <div className="reveal" style={{ '--i': 0 }}>
                <GlassCard className="glow-emerald">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        <img
                          src={activeGif.src}
                          alt={activeGif.label}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-contain shadow-[0_0_24px_rgba(16,185,129,0.28)]"
                        />
                        <span className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-slate-900/90 border border-emerald-500/50 flex items-center justify-center text-lg shadow-lg">
                          {profile.avatar || '🚀'}
                        </span>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl sm:text-2xl font-bold t-main tracking-tight">
                            Welcome back, {profile.name || 'Arjun'}!
                          </h2>
                          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/35">
                            {activeGif.label}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm t-muted mt-1">
                          Savings rate: <strong className="text-emerald-400">{savingsRatePct}%</strong> &bull; Net balance:{' '}
                          <strong className="t-main">{formatINR(totals.net)}</strong> across{' '}
                          <strong>{entries.length}</strong> entries
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button type="button" onClick={() => navigate('profile')} className="btn-ghost inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer">
                        <UserCog className="w-3.5 h-3.5 text-cyan-400" />
                        Name, Emoji &amp; GIFs
                      </button>
                      <button type="button" onClick={() => setReceiptOpen(true)} className="btn-ghost inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer">
                        <ScanLine className="w-3.5 h-3.5 text-emerald-400" />
                        Scan Receipt
                      </button>
                      <button type="button" onClick={() => setExportOpen(true)} className="btn-emerald inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer">
                        <Download className="w-3.5 h-3.5" />
                        Export
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </div>

              <KpiCards totals={totals} series={series} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="reveal lg:col-span-2 [&>*]:h-full" style={{ '--i': 3 }}>
                  <CopilotCard entries={entries} budgets={budgets} goal={goal} onAddEntry={addEntry} onScan={() => setReceiptOpen(true)} />
                </div>
                <div className="reveal [&>*]:h-full" style={{ '--i': 4 }}>
                  <CategoryBreakdown
                    categoryTotals={totals.byCategory}
                    selected={filters.category}
                    onSelect={selectCategoryAndOpenList}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="reveal lg:col-span-2 [&>*]:h-full" style={{ '--i': 5 }}>
                  <TransactionList
                    title={'Latest Activity (' + Math.min(5, entries.length) + ' of ' + entries.length + ')'}
                    entries={entries.slice(0, 5)}
                    sortBy="recent"
                    onDelete={deleteEntry}
                    maxHeight="max-h-96"
                    action={
                      <button type="button" onClick={() => navigate('transactions')} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:underline cursor-pointer">
                        Open Full Ledger <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    }
                  />
                </div>

                <div className="reveal space-y-5" style={{ '--i': 6 }}>
                  <SavingsGoalRing net={totals.net} goal={goal} onChange={setGoal} />
                  <GlassCard title="Explore Pages">
                    <div className="grid grid-cols-2 gap-2">
                      {QUICK_LINKS.map(([pageId, label]) => (
                        <button key={pageId} type="button" onClick={() => navigate(pageId)} className="p-2.5 rounded-xl btn-ghost text-xs font-semibold text-left hover:text-emerald-400 cursor-pointer transition">
                          {label}
                        </button>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              </div>
            </div>
          )}

          {active === 'copilot' && (
            <div className="space-y-5">
              <div className="reveal" style={{ '--i': 0 }}>
                <GlassCard className="glow-emerald">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <img src="/gifs/ai-spark.gif" alt="Kanakku AI Core" className="w-14 h-14 rounded-2xl object-contain" />
                      <div>
                        <h2 className="text-lg font-bold t-main">Kanakku AI Studio (கணக்கு AI)</h2>
                        <p className="text-xs t-muted">Type entries in plain English, ask spending questions, or scan receipt text offline.</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setReceiptOpen(true)} className="btn-emerald inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer">
                      <ScanLine className="w-4 h-4" />
                      Open Receipt Scanner
                    </button>
                  </div>
                </GlassCard>
              </div>

              <div className="reveal" style={{ '--i': 1 }}>
                <CopilotCard entries={entries} budgets={budgets} goal={goal} onAddEntry={addEntry} onScan={() => setReceiptOpen(true)} />
              </div>
            </div>
          )}

          {active === 'transactions' && (
            <div className="space-y-5">
              <div className="reveal" style={{ '--i': 0 }}>
                <FilterBar filters={filters} onChange={setFilters} onReset={() => setFilters(INITIAL_FILTERS)} />
              </div>
              <div className="reveal" style={{ '--i': 1 }}>
                <TransactionList
                  title={'All Transactions (' + filtered.length + ')'}
                  entries={filtered}
                  sortBy={filters.sortBy}
                  onDelete={deleteEntry}
                  maxHeight="max-h-[42rem]"
                  action={
                    <button type="button" onClick={() => setEntryModal({})} className="btn-emerald inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer">
                      <Plus className="w-3.5 h-3.5" /> Add Entry
                    </button>
                  }
                />
              </div>
            </div>
          )}

          {active === 'budgets' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="reveal [&>*]:h-full" style={{ '--i': 0 }}>
                <BudgetProgress budgets={budgets} spent={spent} onChange={setBudgets} />
              </div>
              <div className="reveal [&>*]:h-full" style={{ '--i': 1 }}>
                <RecurringBills bills={recurring} onChange={setRecurring} onLogEntry={addEntry} />
              </div>
            </div>
          )}

          {active === 'goals' && (
            <div className="space-y-5">
              <div className="reveal" style={{ '--i': 0 }}>
                <GlassCard className="glow-emerald">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <img src="/gifs/coin-party.gif" alt="Savings Celebration" className="w-14 h-14 rounded-2xl object-contain" />
                      <div>
                        <h2 className="text-lg font-bold t-main">Wealth Milestones &amp; Emoji Jars</h2>
                        <p className="text-xs t-muted">Track your primary savings target and organize dedicated wishlist jars with custom emojis.</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/35">
                      <Sparkles className="w-3.5 h-3.5" />
                      {jars.length} Active Jars
                    </span>
                  </div>
                </GlassCard>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="reveal [&>*]:h-full" style={{ '--i': 1 }}>
                  <SavingsGoalRing net={totals.net} goal={goal} onChange={setGoal} />
                </div>
                <div className="reveal lg:col-span-2 [&>*]:h-full" style={{ '--i': 2 }}>
                  <SavingsJars jars={jars} onChange={setJars} />
                </div>
              </div>
            </div>
          )}

          {active === 'analytics' && (
            <div className="space-y-5">
              <KpiCards totals={totals} series={series} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="reveal [&>*]:h-full" style={{ '--i': 3 }}>
                  <CashflowChart series={series} />
                </div>
                <div className="reveal [&>*]:h-full" style={{ '--i': 4 }}>
                  <CategoryBreakdown
                    categoryTotals={totals.byCategory}
                    selected={filters.category}
                    onSelect={(cat) => setFilters({ ...filters, category: cat })}
                  />
                </div>
              </div>
            </div>
          )}

          {active === 'profile' && (
            <ProfileStudio
              profile={profile}
              onChange={setProfile}
              onExport={() => setExportOpen(true)}
              hasDemo={hasDemo}
              onClearDemo={clearDemo}
            />
          )}
        </main>
      </div>

      {entryModal && (
        <EntryModal
          initial={entryModal.initial}
          onClose={() => setEntryModal(null)}
          onSave={(entry) => {
            addEntry(entry);
            setEntryModal(null);
          }}
        />
      )}
      {exportOpen && (
        <ExportModal
          filteredEntries={filtered}
          allEntries={entries}
          budgets={budgets}
          goal={goal}
          jars={jars}
          recurring={recurring}
          profile={profile}
          onClose={() => setExportOpen(false)}
        />
      )}
      {receiptOpen && (
        <ReceiptScannerModal
          onClose={() => setReceiptOpen(false)}
          onExtracted={(initial) => {
            setReceiptOpen(false);
            setEntryModal({ initial });
          }}
        />
      )}
    </div>
  );
}
