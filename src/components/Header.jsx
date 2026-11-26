import { useEffect, useRef } from 'react';
import { Plus, Moon, Sun, Download } from 'lucide-react';
import { APP_NAME } from '../constants';
import { PAGES } from './Sidebar';

export default function Header({ darkMode, onToggleTheme, onRecord, onExport, activePage, onNavigate, profile }) {
  const currentPage = PAGES.find((p) => p.id === activePage) || PAGES[0];
  const PageIcon = currentPage.icon;
  const knobPosition = darkMode ? 'left-[31px]' : 'left-1';
  const tabRefs = useRef({});

  useEffect(() => {
    const activeTab = tabRefs.current[activePage];
    if (activeTab && activeTab.scrollIntoView) {
      activeTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [activePage]);

  return (
    <header className="sticky top-0 z-30 glass !rounded-none !border-x-0 !border-t-0 hover:!transform-none">
      <div className="h-16 px-4 sm:px-8 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <h1 className="text-base sm:text-lg font-bold tracking-tight t-main truncate">{APP_NAME}</h1>
          <span
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium t-muted border"
            style={{ background: 'var(--field)', borderColor: 'var(--glass-border)' }}
          >
            <PageIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>{currentPage.label}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => onNavigate('profile')}
            title="Customize Name, Emoji & GIFs"
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/35 hover:bg-emerald-500/20 cursor-pointer transition"
          >
            <span>{profile?.avatar || '🚀'}</span>
            <span>{profile?.name || 'Arjun'}</span>
          </button>

          <button type="button" onClick={onExport} aria-label="Export data" className="btn-ghost inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium cursor-pointer active:scale-95">
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Export</span>
          </button>

          <button type="button" onClick={onRecord} className="btn-emerald inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold cursor-pointer active:scale-95">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Record Entry</span>
          </button>

          <button
            type="button"
            role="switch"
            aria-checked={darkMode}
            aria-label="Toggle dark mode"
            onClick={onToggleTheme}
            className="relative w-[60px] h-8 rounded-full btn-ghost cursor-pointer shrink-0 active:scale-95"
          >
            <Sun className="absolute left-2 top-2 w-4 h-4 text-amber-400" />
            <Moon className="absolute right-2 top-2 w-4 h-4 text-cyan-300" />
            <span className={'absolute top-1 w-6 h-6 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)] transition-all duration-300 ' + knobPosition} />
          </button>
        </div>
      </div>

      <div className="flex lg:hidden items-center no-scrollbar gap-1.5 px-4 py-2 overflow-x-auto border-t" style={{ borderColor: 'var(--glass-border)' }}>
        {PAGES.map((page) => {
          const Icon = page.icon;
          const isActive = activePage === page.id;
          const tabClass = isActive ? 'bg-emerald-500 text-white shadow-sm' : 'btn-ghost t-muted';

          return (
            <button
              key={page.id}
              ref={(el) => { tabRefs.current[page.id] = el; }}
              type="button"
              onClick={() => onNavigate(page.id)}
              className={'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 cursor-pointer active:scale-95 transition ' + tabClass}
            >
              <Icon className="w-3.5 h-3.5" />
              {page.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
