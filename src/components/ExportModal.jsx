import { useState } from 'react';
import { CircleCheck, Download, FileJson, FileSpreadsheet, FileText } from 'lucide-react';
import Modal from './Modal';
import { exportCSV, exportJSON, printReport } from '../utils/exportData';

const FORMATS = [
  { id: 'csv', label: 'CSV', hint: 'Excel-ready spreadsheet with emojis', icon: FileSpreadsheet, color: '#10B981' },
  { id: 'json', label: 'JSON', hint: 'Full backup with budgets, jars & profile', icon: FileJson, color: '#22D3EE' },
  { id: 'pdf', label: 'PDF Report', hint: 'Printable financial statement', icon: FileText, color: '#F43F5E' },
];

export default function ExportModal({ filteredEntries, allEntries, budgets, goal, jars, recurring, profile, onClose }) {
  const [scope, setScope] = useState('filtered');
  const [format, setFormat] = useState('csv');
  const [done, setDone] = useState('');

  const entries = scope === 'filtered'
    ? filteredEntries
    : [...allEntries].sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || 0) - (a.createdAt || 0));
  const scopeLabel = scope === 'filtered' ? 'Filtered transactions' : 'All history';

  const run = () => {
    if (format === 'csv') exportCSV(entries);
    else if (format === 'json') exportJSON({ entries, budgets, goal, jars, recurring, profile, scope: scopeLabel });
    else printReport(entries, scopeLabel, profile);
    setDone(format === 'pdf' ? 'Print dialog opened. Choose "Save as PDF" as the destination.' : `Your ${format.toUpperCase()} file is downloading.`);
  };

  const option = (active) =>
    `rounded-xl p-3 text-left cursor-pointer border transition ${active ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_18px_rgba(16,185,129,0.2)]' : 'btn-ghost'}`;

  return (
    <Modal title="Export Data" onClose={onClose} wide>
      <div className="space-y-5">
        <div>
          <p className="text-xs t-muted mb-2">What to export</p>
          <div className="grid grid-cols-2 gap-3">
            {[['filtered', 'Current filter', filteredEntries.length], ['all', 'All history', allEntries.length]].map(([id, label, count]) => (
              <button key={id} type="button" onClick={() => { setScope(id); setDone(''); }} className={option(scope === id)}>
                <span className="block text-sm font-semibold t-main">{label}</span>
                <span className="block text-xs t-muted">{count} transactions</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs t-muted mb-2">Format</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {FORMATS.map(({ id, label, hint, icon: Icon, color }) => (
              <button key={id} type="button" onClick={() => { setFormat(id); setDone(''); }} className={option(format === id)}>
                <span className="inline-flex p-1.5 rounded-lg mb-2" style={{ background: `${color}22`, color, boxShadow: `0 0 14px ${color}44` }}>
                  <Icon className="w-4 h-4" />
                </span>
                <span className="block text-sm font-semibold t-main">{label}</span>
                <span className="block text-xs t-muted">{hint}</span>
              </button>
            ))}
          </div>
        </div>

        {entries.length === 0 && <p className="text-sm text-rose-400">There are no transactions in this selection yet.</p>}
        {done && (
          <p className="text-sm text-emerald-400 flex items-center gap-2 fade-up"><CircleCheck className="w-4 h-4 shrink-0" />{done}</p>
        )}

        <button type="button" onClick={run} disabled={entries.length === 0} className="btn-emerald w-full py-2.5 rounded-xl font-semibold cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
          <Download className="w-4 h-4" />
          Export {format === 'pdf' ? 'PDF Report' : format.toUpperCase()}
        </button>
      </div>
    </Modal>
  );
}
