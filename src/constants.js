export const APP_NAME = 'Smart Expense Tracker';

export const EXPENSE_CATEGORIES = [
  { name: 'Food', color: '#F43F5E', emoji: '🍔' },
  { name: 'Travel', color: '#22D3EE', emoji: '🚕' },
  { name: 'Bills', color: '#F59E0B', emoji: '💡' },
  { name: 'Shopping', color: '#8B5CF6', emoji: '🛍️' },
  { name: 'Others', color: '#64748B', emoji: '✨' },
];

export const INCOME_CATEGORIES = [
  { name: 'Salary', color: '#10B981', emoji: '💰' },
  { name: 'Freelance', color: '#2DD4BF', emoji: '💻' },
  { name: 'Investments', color: '#4ADE80', emoji: '📈' },
  { name: 'Gift / Bonus', color: '#38BDF8', emoji: '🎁' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const AVATAR_EMOJIS = [
  '🚀', '🦁', '👑', '💎', '🔥', '🦊', '🎯', '🌟',
  '😎', '🧠', '⚡', '🐉', '🦄', '🍀', '🏆', '🎨',
  '🎧', '🏍️', '✈️', '🛸', '🐼', '🐯', '🦅', '🌊',
];

export const ENTRY_EMOJIS = [
  '🍔', '🍕', '☕', '🍱', '🛒', '🚕', '⛽', '✈️',
  '💡', '📶', '🏠', '📱', '🛍️', '👟', '🎬', '🏋️',
  '💊', '🎮', '💰', '💻', '📈', '🎁', '🎉', '✨',
];

export const GIF_STICKERS = [
  { id: 'auto', label: 'Auto Smart Mood', src: '/gifs/rocket-wealth.gif', desc: 'Switches automatically based on your savings rate and budget health' },
  { id: 'rocket', label: 'Wealth Rocket', src: '/gifs/rocket-wealth.gif', desc: 'High-energy savings and growth mode' },
  { id: 'coin', label: 'Rupee Coin Party', src: '/gifs/coin-party.gif', desc: 'Celebrate income inflows and milestone wins' },
  { id: 'fire', label: 'Streak Flame', src: '/gifs/fire-streak.gif', desc: 'Keep your daily expense-tracking streak alive' },
  { id: 'ai', label: 'Kanakku AI Core', src: '/gifs/ai-spark.gif', desc: 'Futuristic AI insights pulse' },
  { id: 'alert', label: 'Budget Radar', src: '/gifs/alert-pulse.gif', desc: 'Active monthly spending watch indicator' },
];

export const DEFAULT_PROFILE = {
  name: 'Arjun',
  avatar: '🚀',
  gifMode: 'auto',
};

export const DEFAULT_RECURRING = [
  { id: 'rec-1', title: 'WiFi Broadband', amount: 999, category: 'Bills', emoji: '📶', dueDay: 10, active: true },
  { id: 'rec-2', title: 'Electricity Bill', amount: 1450, category: 'Bills', emoji: '⚡', dueDay: 5, active: true },
  { id: 'rec-3', title: 'Gym Membership', amount: 700, category: 'Others', emoji: '🏋️', dueDay: 12, active: true },
  { id: 'rec-4', title: 'Mobile Recharge', amount: 399, category: 'Bills', emoji: '📱', dueDay: 13, active: true },
];

export const DEFAULT_JARS = [
  { id: 'jar-1', name: 'Emergency Fund', emoji: '🛡️', target: 100000, saved: 65000, color: '#10B981' },
  { id: 'jar-2', name: 'Goa & Munnar Trip', emoji: '✈️', target: 35000, saved: 21000, color: '#22D3EE' },
  { id: 'jar-3', name: 'New Gadget Upgrade', emoji: '📱', target: 50000, saved: 18500, color: '#8B5CF6' },
];

export const BUDGET_CATEGORIES = ['Food', 'Travel', 'Bills', 'Shopping'];

export const DEFAULT_BUDGETS = { Food: 6500, Travel: 6000, Bills: 5000, Shopping: 6000 };
export const DEFAULT_GOAL = { target: 160000 };

export function getCategoryColor(name) {
  const found = ALL_CATEGORIES.find((c) => c.name === name);
  return found ? found.color : '#64748B';
}

export function getCategoryEmoji(name) {
  const found = ALL_CATEGORIES.find((c) => c.name === name);
  return found ? found.emoji : '✨';
}

export function getSmartEmoji(category, note = '') {
  const text = note.toLowerCase();
  if (/coffee|tea|cafe/.test(text)) return '☕';
  if (/pizza|burger/.test(text)) return '🍕';
  if (/grocer|vegetable|milk|fruit/.test(text)) return '🛒';
  if (/dinner|lunch|breakfast|biryani|restaurant|meal|snack|sandwich/.test(text)) return '🍱';
  if (/fuel|petrol|diesel/.test(text)) return '⛽';
  if (/flight|trip|bus|train/.test(text)) return '✈️';
  if (/cab|taxi|auto|metro|ride/.test(text)) return '🚕';
  if (/wifi|internet|broadband/.test(text)) return '📶';
  if (/electric|power/.test(text)) return '⚡';
  if (/rent|maintenance|house|water|gas/.test(text)) return '🏠';
  if (/recharge|phone|mobile/.test(text)) return '📱';
  if (/shoe|clothes|shirt|dress|mall|accessor/.test(text)) return '🛍️';
  if (/movie|cinema/.test(text)) return '🎬';
  if (/gym|fitness/.test(text)) return '🏋️';
  if (/pharmacy|doctor|medicine|hospital/.test(text)) return '💊';
  if (/salary|payroll/.test(text)) return '💰';
  if (/freelance|project|client|logo/.test(text)) return '💻';
  if (/dividend|stock|invest/.test(text)) return '📈';
  if (/bonus|gift|cashback/.test(text)) return '🎁';
  return getCategoryEmoji(category);
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompact(amount) {
  const value = Math.abs(amount);

  if (value >= 10000000) {
    return '₹' + Math.round((amount / 10000000) * 10) / 10 + 'Cr';
  }
  if (value >= 100000) {
    return '₹' + Math.round((amount / 100000) * 10) / 10 + 'L';
  }
  if (value >= 1000) {
    return '₹' + Math.round((amount / 1000) * 10) / 10 + 'K';
  }
  return '₹' + Math.round(amount);
}
