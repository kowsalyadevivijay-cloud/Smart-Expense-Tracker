function pad(num) {
  return String(num).padStart(2, '0');
}

export function toDateStr(date) {
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
}

export function todayStr() {
  return toDateStr(new Date());
}

export function parseDateStr(str) {
  const parts = str.split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

export function daysAgoStr(days, from = new Date()) {
  const date = new Date(from.getFullYear(), from.getMonth(), from.getDate() - days);
  return toDateStr(date);
}

export function formatLongDate(str) {
  return parseDateStr(str).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatShortDate(str) {
  return parseDateStr(str).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function monthKey(str) {
  return str.slice(0, 7);
}

export function daysInMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}
