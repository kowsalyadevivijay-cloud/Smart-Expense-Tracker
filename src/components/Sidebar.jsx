import { LayoutDashboard, Sparkles, PiggyBank, Target, ChartColumn, ReceiptText, UserCog, PanelLeftClose, PanelLeftOpen, Eraser, Download } from 'lucide-react';
import { APP_NAME } from '../constants';

export const PAGES = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
  { id: 'copilot', label: 'Kanakku AI', icon: Sparkles, badge: 'AI' },
  { id: 'transactions', label: 'Transactions', icon: ReceiptText, badge: null },
  { id: 'budgets', label: 'Budgets & Bills', icon: PiggyBank, badge: null },
  { id: 'goals', label: 'Goals & Jars', icon: Target, badge: null },
  { id: 'analytics', label: 'Analytics', icon: ChartColumn, badge: null },
  { id: 'profile', label: 'Profile & GIFs', icon: UserCog, badge: null },
];

export default function Sidebar({ collapsed, onToggle, active, onNavigate, hasDemo, onClearDemo, onExport, profile, entryCount }) {
  const asideWidth = collapsed ? 'w-[76px]' : 'w-64';
  const centerIfCollapsed = collapsed ? 'justify-center' : '';

  return (
    <aside
      className={'hidden lg:flex flex-col shrink-0 sticky top-0 h-screen glass !rounded-none !border-y-0 !border-l-0 transition-all duration-300 hover:!transform-none ' + asideWidth}
    >
      <button
        type="button"
        onClick={() => onNavigate('profile')}
        title="Customize Name, Emoji & GIFs"
        className="h-16 px-4 flex items-center gap-3 border-b text-left cursor-pointer hover:bg-white/5 transition"
        style={{ borderColor: 'var(--glass-border)' }}
      >
        <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-emerald-500/25 to-cyan-500/25 border border-emerald-500/40 flex items-center justify-center text-xl shadow-[0_0_16px_rgba(16,185,129,0.3)]">
          {profile?.avatar || '🚀'}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold t-main leading-tight truncate">{APP_NAME}</p>
            <p className="text-[11px] text-emerald-400 font-medium truncate mt-0.5">Hi, {profile?.name || 'Arjun'}</p>
          </div>
        )}
      </button>

      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {PAGES.map((page) => {
          const Icon = page.icon;
          const isActive = active === page.id;
          const countPill = page.id === 'transactions' ? entryCount : page.badge;
          const itemClass = isActive
            ? 'bg-emerald-500/15 text-emerald-400 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.35)]'
            : 't-muted hover:bg-emerald-500/10 hover:text-emerald-400';

          return (
            <button
              key={page.id}
              type="button"
              onClick={() => onNavigate(page.id)}
              title={page.label}
              className={'w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition ' + itemClass + (collapsed ? ' !justify-center' : '')}
            >
              <span className="flex items-center gap-3 min-w-0">
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="truncate">{page.label}</span>}
              </span>
              {!collapsed && countPill !== null && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                  {countPill}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 space-y-2 border-t" style={{ borderColor: 'var(--glass-border)' }}>
        <button
          type="button"
          onClick={onExport}
          title="Export Data"
          className={'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium btn-ghost cursor-pointer ' + centerIfCollapsed}
        >
          <Download className="w-4 h-4 shrink-0 text-emerald-400" />
          {!collapsed && 'Export Data'}
        </button>

        {hasDemo && (
          <button
            type="button"
            onClick={onClearDemo}
            title="Clear Demo Data"
            className={'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs btn-ghost cursor-pointer ' + centerIfCollapsed}
          >
            <Eraser className="w-4 h-4 shrink-0" />
            {!collapsed && 'Clear Demo Data'}
          </button>
        )}

        <div className={'flex items-center gap-2 px-3 py-2 text-xs t-muted ' + centerIfCollapsed} title="All data is saved in this browser">
          <span className="relative flex w-2 h-2 shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70 animate-ping" />
            <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
          </span>
          {!collapsed && 'Synced to local storage'}
        </div>

        <button type="button" onClick={onToggle} aria-label="Toggle sidebar" className="w-full flex items-center justify-center p-2 rounded-xl btn-ghost cursor-pointer">
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
