import { APP_NAME, formatCurrency, getSmartEmoji } from '../constants';
import { summarise } from './aiParser';
import { formatLongDate, todayStr } from './dateUtils';

export function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function makeFilename(extension) {
  return 'smart-expense-tracker-' + todayStr() + '.' + extension;
}

function protectText(value) {
  const text = String(value ?? '');
  if (/^[=+\-@]/.test(text)) {
    return "'" + text;
  }
  return text;
}

function csvCell(value) {
  const text = String(value ?? '');
  if (/[",\r\n]/.test(text)) {
    return '"' + text.replace(/"/g, '""') + '"';
  }
  return text;
}

export function buildCSV(entries) {
  const lines = [];
  lines.push(['Date', 'Emoji', 'Type', 'Category', 'Amount (₹)', 'Signed Amount (₹)', 'Note', 'AI Tagged'].map(csvCell).join(','));

  for (const entry of entries) {
    const isIncome = entry.type === 'income';
    const emoji = entry.emoji || getSmartEmoji(entry.category, entry.note);
    const row = [
      entry.date,
      emoji,
      isIncome ? 'Income' : 'Expense',
      protectText(entry.category),
      entry.amount.toFixed(2),
      (isIncome ? entry.amount : -entry.amount).toFixed(2),
      protectText(entry.note),
      entry.aiTagged ? 'Yes' : 'No',
    ];
    lines.push(row.map(csvCell).join(','));
  }

  return '\uFEFF' + lines.join('\r\n') + '\r\n';
}

export function exportCSV(entries) {
  downloadFile(makeFilename('csv'), buildCSV(entries), 'text/csv;charset=utf-8');
}

export function buildJSON({ entries, budgets, goal, jars, recurring, profile, scope }) {
  const totals = summarise(entries);
  const data = {
    app: APP_NAME,
    currency: 'INR',
    exportedAt: new Date().toISOString(),
    scope: scope,
    profile: profile,
    summary: {
      totalIncome: totals.income,
      totalExpenses: totals.expense,
      netBalance: totals.net,
      transactionCount: entries.length,
    },
    transactions: entries,
    budgets: budgets,
    savingsGoal: goal,
    savingsJars: jars,
    recurringBills: recurring,
  };
  return JSON.stringify(data, null, 2);
}

export function exportJSON(payload) {
  downloadFile(makeFilename('json'), buildJSON(payload), 'application/json;charset=utf-8');
}

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const REPORT_STYLE = `
  @page { size: A4; margin: 14mm; }
  body { font-family: Arial, sans-serif; color: #0f172a; font-size: 12px; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  h2 { font-size: 14px; margin: 22px 0 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
  .meta { color: #64748b; margin-bottom: 16px; }
  .boxes { display: flex; gap: 10px; }
  .box { flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; }
  .box small { display: block; color: #64748b; margin-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; background: #f1f5f9; padding: 6px 8px; }
  td { padding: 6px 8px; border-bottom: 1px solid #eef2f7; }
  tr { page-break-inside: avoid; }
  .right { text-align: right; }
  .income { color: #059669; }
  .expense { color: #e11d48; }
`;

export function buildReportHTML(entries, scopeLabel, profile) {
  const totals = summarise(entries);
  const ownerTitle = `${APP_NAME} — Financial Statement${profile?.name ? ` (${profile.avatar || '🚀'} ${escapeHtml(profile.name)})` : ''}`;

  let savingsRate = 'N/A';
  if (totals.income > 0) {
    savingsRate = ((totals.net / totals.income) * 100).toFixed(1) + '%';
  }

  const categories = Object.entries(totals.byCategory);
  categories.sort((a, b) => b[1] - a[1]);

  let categoryRows = '';
  for (const [name, amount] of categories) {
    const share = totals.expense ? ((amount / totals.expense) * 100).toFixed(1) : '0.0';
    categoryRows += '<tr><td>' + escapeHtml(name) + '</td><td class="right">' + formatCurrency(amount) + '</td><td class="right">' + share + '%</td></tr>';
  }

  let ledgerRows = '';
  for (const entry of entries) {
    const sign = entry.type === 'income' ? '+' : '-';
    const emoji = entry.emoji || getSmartEmoji(entry.category, entry.note);
    ledgerRows += '<tr>'
      + '<td>' + formatLongDate(entry.date) + '</td>'
      + '<td>' + escapeHtml(emoji + ' ' + entry.note) + '</td>'
      + '<td>' + escapeHtml(entry.category) + '</td>'
      + '<td class="right ' + entry.type + '">' + sign + formatCurrency(entry.amount) + '</td>'
      + '</tr>';
  }

  const categoryTable = categories.length
    ? '<table><tr><th>Category</th><th class="right">Amount</th><th class="right">Share</th></tr>' + categoryRows + '</table>'
    : '<p>No expenses in this selection.</p>';

  const ledgerTable = entries.length
    ? '<table><tr><th>Date</th><th>Note</th><th>Category</th><th class="right">Amount</th></tr>' + ledgerRows + '</table>'
    : '<p>No transactions in this selection.</p>';

  return '<!doctype html><html><head><meta charset="utf-8"><title>Expense Report</title><style>' + REPORT_STYLE + '</style></head><body>'
    + '<h1>' + ownerTitle + '</h1>'
    + '<div class="meta">Generated on ' + formatLongDate(todayStr()) + ' | ' + escapeHtml(scopeLabel) + ' | ' + entries.length + ' transactions</div>'
    + '<div class="boxes">'
    + '<div class="box"><small>Total Income</small><b class="income">+' + formatCurrency(totals.income) + '</b></div>'
    + '<div class="box"><small>Total Expenses</small><b class="expense">-' + formatCurrency(totals.expense) + '</b></div>'
    + '<div class="box"><small>Net Balance</small><b>' + formatCurrency(totals.net) + '</b></div>'
    + '<div class="box"><small>Savings Rate</small><b>' + savingsRate + '</b></div>'
    + '</div>'
    + '<h2>Spending by Category</h2>' + categoryTable
    + '<h2>All Transactions</h2>' + ledgerTable
    + '</body></html>';
}

export function printReport(entries, scopeLabel, profile) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.width = '1px';
  iframe.style.height = '1px';
  iframe.style.opacity = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(buildReportHTML(entries, scopeLabel, profile));
  doc.close();

  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  }, 300);

  setTimeout(() => iframe.remove(), 5 * 60 * 1000);
}
