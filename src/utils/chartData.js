import { formatShortDate } from './dateUtils';

export function buildSeries(entries) {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const byDate = new Map();

  for (const entry of sorted) {
    const row = byDate.get(entry.date) || { date: entry.date, income: 0, expense: 0 };
    row[entry.type] += entry.amount;
    byDate.set(entry.date, row);
  }

  let runningIncome = 0;
  let runningExpense = 0;
  const series = [];

  for (const row of byDate.values()) {
    runningIncome += row.income;
    runningExpense += row.expense;
    series.push({
      ...row,
      label: formatShortDate(row.date),
      cumIncome: runningIncome,
      cumExpense: runningExpense,
      cumNet: runningIncome - runningExpense,
    });
  }

  return series;
}
