import { formatINR } from '../constants';
import { todayStr, toDateStr, daysAgoStr, formatShortDate, monthKey, daysInMonth } from './dateUtils';

const EXPENSE_KEYWORDS = {
  Food: ['food', 'dinner', 'lunch', 'breakfast', 'snack', 'coffee', 'tea', 'cafe', 'restaurant', 'biryani',
    'pizza', 'burger', 'meal', 'grocery', 'groceries', 'vegetable', 'fruit', 'milk', 'bakery', 'juice', 'dining'],
  Travel: ['cab', 'taxi', 'auto', 'fuel', 'petrol', 'diesel', 'train', 'bus', 'metro', 'flight',
    'ticket', 'toll', 'parking', 'ride', 'trip', 'travel', 'uber', 'ola'],
  Bills: ['electricity', 'wifi', 'broadband', 'internet', 'recharge', 'rent', 'bill', 'water', 'gas',
    'insurance', 'emi', 'subscription', 'maintenance', 'tax'],
  Shopping: ['shopping', 'clothes', 'shirt', 'shoes', 'dress', 'jeans', 'mall', 'gadget',
    'headphones', 'bag', 'watch', 'furniture', 'electronics', 'bought', 'purchase'],
};

const INCOME_KEYWORDS = {
  Salary: ['income', 'salary', 'wage', 'payroll', 'stipend', 'pension', 'sambalam', 'varavu'],
  Freelance: ['freelance', 'client', 'project', 'gig', 'contract', 'commission'],
  Investments: ['dividend', 'interest', 'stocks', 'investment', 'returns', 'profit'],
  'Gift / Bonus': ['bonus', 'gift', 'cashback', 'refund', 'reward', 'festival', 'scholarship', 'allowance', 'prize'],
};

const STRONG_INCOME_WORDS = [
  'income', 'salary', 'received', 'receiving', 'freelance', 'bonus', 'refund',
  'credited', 'credit', 'earned', 'earn', 'earning', 'dividend', 'payout',
  'stipend', 'cashback', 'wage', 'payroll', 'profit', 'returns',
  'reimbursement', 'scholarship', 'pension', 'allowance', 'varavu', 'sambalam',
];

const CONTEXT_INCOME_WORDS = ['got', 'gift', 'interest', 'reward', 'prize', 'commission'];
const EXPLICIT_EXPENSE_WORDS = ['spent', 'spend', 'paid', 'pay', 'bought', 'purchase', 'purchased', 'debited', 'debit'];

function hasWord(text, word) {
  const pattern = new RegExp('\\b' + word + '(?:s|es)?\\b', 'i');
  return pattern.test(text);
}

function pickCategory(text, keywordList, defaultCategory) {
  let bestCategory = defaultCategory;
  let bestScore = 0;

  for (const category in keywordList) {
    let score = 0;
    for (const word of keywordList[category]) {
      if (hasWord(text, word)) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }
  return bestCategory;
}

export function detectType(text) {
  for (const word of STRONG_INCOME_WORDS) {
    if (hasWord(text, word)) {
      return 'income';
    }
  }

  const hasExpenseVerb = EXPLICIT_EXPENSE_WORDS.some((word) => hasWord(text, word));
  if (!hasExpenseVerb) {
    for (const word of CONTEXT_INCOME_WORDS) {
      if (hasWord(text, word)) {
        return 'income';
      }
    }
  }

  return 'expense';
}

export function detectCategory(text, type) {
  if (type === 'income') {
    return pickCategory(text, INCOME_KEYWORDS, 'Gift / Bonus');
  }
  return pickCategory(text, EXPENSE_KEYWORDS, 'Others');
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const DATE_ISO = /\b(\d{4})-(\d{2})-(\d{2})\b/;
const DATE_NUMERIC = /\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})\b/;
const DATE_NAMED = new RegExp('\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(' + MONTHS.join('|') + ')[a-z]*\\.?,?(?:\\s+(\\d{4}))?\\b', 'i');

function makeDate(year, month, day) {
  const date = new Date(year, month - 1, day);
  const isReal = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return isReal ? toDateStr(date) : null;
}

export function extractDate(text) {
  let match = text.match(DATE_ISO);
  if (match) {
    return { date: makeDate(Number(match[1]), Number(match[2]), Number(match[3])), token: match[0] };
  }

  match = text.match(DATE_NUMERIC);
  if (match) {
    let year = Number(match[3]);
    if (match[3].length === 2) {
      year = 2000 + year;
    }
    return { date: makeDate(year, Number(match[2]), Number(match[1])), token: match[0] };
  }

  match = text.match(DATE_NAMED);
  if (match) {
    const year = match[3] ? Number(match[3]) : new Date().getFullYear();
    const month = MONTHS.indexOf(match[2].toLowerCase().slice(0, 3)) + 1;
    return { date: makeDate(year, month, Number(match[1])), token: match[0] };
  }

  match = text.match(/\byesterday\b/i);
  if (match) {
    return { date: daysAgoStr(1), token: match[0] };
  }

  match = text.match(/\btoday\b/i);
  if (match) {
    return { date: todayStr(), token: match[0] };
  }

  return { date: null, token: null };
}

function toNumber(text) {
  const clean = text.replace(/[,\s]/g, '').toLowerCase();
  let value = parseFloat(clean);
  if (clean.endsWith('k')) {
    value = value * 1000;
  }
  return Number.isNaN(value) ? null : value;
}

export function extractAmount(text, dateToken) {
  let cleanText = text;
  if (dateToken) {
    cleanText = text.replace(dateToken, ' ');
  }

  const number = '(\\d[\\d,]*(?:\\.\\d+)?(?:\\s?k\\b)?)';

  let match = cleanText.match(new RegExp('(?:₹|\\b(?:rs|inr)\\b\\.?)\\s*' + number, 'i'));
  if (!match) {
    match = cleanText.match(new RegExp(number + '\\s*(?:rupees|rs\\b|/-)', 'i'));
  }
  if (!match) {
    match = cleanText.match(new RegExp(number, 'i'));
  }

  if (!match) {
    return { amount: null, token: null };
  }
  return { amount: toNumber(match[1]), token: match[0] };
}

function makeNote(text, tokens, defaultNote) {
  let note = text;

  for (const token of tokens) {
    if (token) {
      note = note.replace(token, ' ');
    }
  }

  note = note.replace(/\b(spent|spend|paid|pay|received|got|bought|add|added|record)\b/gi, ' ');
  note = note.replace(/₹|\b(rs|inr)\b\.?/gi, ' ');
  note = note.replace(/\s+/g, ' ').trim();
  note = note.replace(/^(on|for|to|at|from|of|in|by)\s+/i, '');
  note = note.replace(/\s+(on|for|to|at|from|of|in|by)$/i, '');

  if (note === '') {
    note = defaultNote;
  }
  return note.charAt(0).toUpperCase() + note.slice(1);
}

export function parseTransaction(rawText) {
  const text = (rawText || '').trim();
  if (text === '') {
    return { ok: false, reason: 'empty' };
  }

  const dateInfo = extractDate(text);
  const amountInfo = extractAmount(text, dateInfo.token);
  if (!amountInfo.amount || amountInfo.amount <= 0) {
    return { ok: false, reason: 'no-amount' };
  }

  const type = detectType(text);
  const category = detectCategory(text, type);
  const note = makeNote(text, [amountInfo.token, dateInfo.token], category);

  return {
    ok: true,
    entry: {
      type: type,
      amount: amountInfo.amount,
      category: category,
      date: dateInfo.date || todayStr(),
      note: note,
      aiTagged: true,
    },
  };
}

export function summarise(entries) {
  const totals = {
    income: 0,
    expense: 0,
    net: 0,
    byCategory: {},
    incomeByCategory: {},
    count: { income: 0, expense: 0 },
  };

  for (const entry of entries) {
    totals[entry.type] += entry.amount;
    totals.count[entry.type] += 1;

    if (entry.type === 'expense') {
      totals.byCategory[entry.category] = (totals.byCategory[entry.category] || 0) + entry.amount;
    } else if (entry.type === 'income') {
      totals.incomeByCategory[entry.category] = (totals.incomeByCategory[entry.category] || 0) + entry.amount;
    }
  }

  totals.net = totals.income - totals.expense;
  return totals;
}

function sumExpenses(entries, fromDate, toDate, category) {
  let sum = 0;
  for (const entry of entries) {
    if (entry.type !== 'expense') continue;
    if (entry.date < fromDate || entry.date > toDate) continue;
    if (category && entry.category !== category) continue;
    sum += entry.amount;
  }
  return sum;
}

export function monthlySpendByCategory(entries, today = new Date()) {
  const thisMonth = monthKey(toDateStr(today));
  const result = {};

  for (const entry of entries) {
    if (entry.type === 'expense' && monthKey(entry.date) === thisMonth) {
      result[entry.category] = (result[entry.category] || 0) + entry.amount;
    }
  }
  return result;
}

export function generateInsights(entries, budgets, today = new Date()) {
  const all = summarise(entries);
  const chips = [];
  const tips = [];

  let topCategory = null;
  for (const name in all.byCategory) {
    if (!topCategory || all.byCategory[name] > topCategory.amount) {
      topCategory = { name: name, amount: all.byCategory[name] };
    }
  }

  const thisMonth = monthKey(toDateStr(today));
  let monthIncome = 0;
  let monthExpense = 0;
  for (const entry of entries) {
    if (monthKey(entry.date) !== thisMonth) continue;
    if (entry.type === 'income') monthIncome += entry.amount;
    else monthExpense += entry.amount;
  }
  const projectedExpense = (monthExpense / today.getDate()) * daysInMonth(today);
  const projectedSavings = monthIncome - projectedExpense;

  if (topCategory) {
    chips.push({ tone: 'neutral', text: 'Top spend category: ' + topCategory.name + ' (' + formatINR(topCategory.amount) + ')' });
  }
  chips.push({
    tone: projectedSavings >= 0 ? 'good' : 'warn',
    text: 'Projected Monthly Savings: ' + formatINR(projectedSavings),
  });

  const thisWeekFrom = daysAgoStr(6, today);
  const thisWeekTo = toDateStr(today);
  const lastWeekFrom = daysAgoStr(13, today);
  const lastWeekTo = daysAgoStr(7, today);

  let biggestRise = null;
  for (const category in all.byCategory) {
    const thisWeek = sumExpenses(entries, thisWeekFrom, thisWeekTo, category);
    const lastWeek = sumExpenses(entries, lastWeekFrom, lastWeekTo, category);

    if (lastWeek > 0 && thisWeek > lastWeek * 1.1) {
      const percent = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
      if (!biggestRise || percent > biggestRise.percent) {
        biggestRise = { category: category, percent: percent, extra: thisWeek - lastWeek };
      }
    }
  }
  if (biggestRise) {
    chips.push({ tone: 'warn', text: biggestRise.category + ' spend up ' + biggestRise.percent + '% this week' });
    tips.push(biggestRise.category + ' spending rose ' + biggestRise.percent + '% compared to last week. Try to keep it within ' + formatINR(biggestRise.extra) + ' of last week.');
  }

  const spent = monthlySpendByCategory(entries, today);
  for (const category in budgets) {
    const limit = budgets[category];
    if (!limit) continue;

    const used = spent[category] || 0;
    const percent = (used / limit) * 100;

    if (percent > 90) {
      tips.push(category + ' budget is at ' + Math.round(percent) + '%. Only ' + formatINR(Math.max(0, limit - used)) + ' left this month.');
    } else if (percent >= 75) {
      tips.push(category + ' budget has crossed 75%. Slow down to stay within ' + formatINR(limit) + '.');
    }
  }

  if (all.income > 0) {
    const rate = (all.net / all.income) * 100;
    if (rate < 20) {
      tips.push('Your savings rate is ' + rate.toFixed(0) + '%. Try to reach 20% by cutting one flexible category.');
    } else if (rate >= 30) {
      tips.push('Great job! You are saving ' + rate.toFixed(0) + '% of your income. Think about investing some of it.');
    }
  }

  if (topCategory && all.expense > 0 && topCategory.amount / all.expense > 0.4) {
    const share = Math.round((topCategory.amount / all.expense) * 100);
    tips.push(topCategory.name + ' is ' + share + '% of your spending, so this is the best place to save.');
  }

  if (tips.length === 0) {
    tips.push('Add a few entries and I will start showing patterns in your spending.');
  }

  return { topCategory, projectedSavings, chips: chips.slice(0, 4), tips };
}

export function matchConversation(rawText, entries = []) {
  const clean = (rawText || '').trim().toLowerCase().replace(/[!.,?]+$/g, '');
  if (!clean || /\d/.test(clean)) return null;

  const s = summarise(entries);

  if (/^(hi+|hello+|helo+|hey+|vanakkam|namaste|yo|hola|good\s*(morning|afternoon|evening))$/.test(clean)) {
    const greeting = clean.startsWith('good ')
      ? clean.charAt(0).toUpperCase() + clean.slice(1) + '!'
      : 'Vanakkam!';

    if (entries.length === 0) {
      return greeting + ' I am Kanakku AI. Your ledger is ready — try typing "Spent ₹450 on dinner" or "Income ₹15,000".';
    }
    return greeting + ' Your net balance is ' + formatINR(s.net) + ' across ' + entries.length + ' entries. Log an income/expense or ask me about your spending.';
  }

  if (/^(how\s*(are|r)\s*(you|u)|how\s*is\s*it\s*going|eppadi\s*iruk(inga|eenga)?)$/.test(clean)) {
    return 'Doing great and keeping your numbers organized! Your current net balance is ' + formatINR(s.net) + '. What would you like to record or check today?';
  }

  if (/^(who\s*are\s*you|what\s*(are\s*you|can\s*you\s*do)|help|commands|guide)$/.test(clean)) {
    return 'I am Kanakku AI (கணக்கு AI), your personal finance assistant. Try:\n' +
      '• Log entries: "Spent ₹450 on dinner" or "Income ₹5,000"\n' +
      '• Check spending: "How much did I spend on Food this month?"\n' +
      '• Insights: "Summary", "Budget status", or "Daily safe spend"\n' +
      '• Records: "Biggest expense?" or "Latest transaction"';
  }

  if (/^(thanks?|thank\s*you|thx|nandri|awesome|great|nice|super|cool)$/.test(clean)) {
    return 'You are welcome! Let me know whenever you want to log a new entry or check your financial insights.';
  }

  if (/^(bye+|goodbye|see\s*you|good\s*night)$/.test(clean)) {
    return 'Goodbye! All your entries are safely saved in your browser. See you next time.';
  }

  return null;
}

export function isQuestion(text) {
  const clean = text.trim();
  const endsWithQuestionMark = clean.endsWith('?');
  const startsLikeQuestion = /^(how|what|which|who|when|where|show|tell|give|biggest|largest|smallest|lowest|top|total|average|latest|last|recent|summary|overview|report|am i|do i|can i|is my|are my)\b/i.test(clean);
  return endsWithQuestionMark || startsLikeQuestion;
}

const EXPENSE_CAT_NAMES = ['Food', 'Travel', 'Bills', 'Shopping', 'Others'];
const INCOME_CAT_NAMES = ['Salary', 'Freelance', 'Investments', 'Gift / Bonus'];

const CATEGORY_ALIASES = {
  Food: ['food', 'dinner', 'lunch', 'breakfast', 'groceries', 'grocery', 'coffee', 'dining', 'restaurant'],
  Travel: ['travel', 'fuel', 'petrol', 'cab', 'taxi', 'auto', 'bus', 'train', 'metro', 'flight'],
  Bills: ['bills', 'bill', 'electricity', 'wifi', 'internet', 'rent', 'recharge', 'emi'],
  Shopping: ['shopping', 'clothes', 'shoes', 'gadget', 'electronics'],
  Others: ['others', 'other', 'misc', 'gym', 'movie', 'pharmacy'],
  Salary: ['salary', 'payroll', 'wage'],
  Freelance: ['freelance', 'client', 'project'],
  Investments: ['investments', 'investment', 'dividend', 'stocks'],
  'Gift / Bonus': ['gift', 'bonus', 'cashback', 'refund'],
};

function findMentionedCategory(q) {
  for (const name of [...EXPENSE_CAT_NAMES, ...INCOME_CAT_NAMES]) {
    if (q.includes(name.toLowerCase())) return name;
  }
  for (const [cat, words] of Object.entries(CATEGORY_ALIASES)) {
    if (words.some((w) => hasWord(q, w))) return cat;
  }
  return null;
}

export function answerQuestion(question, entries, options = {}) {
  const budgets = options.budgets || {};
  const goal = options.goal || { target: 0 };
  const q = question.toLowerCase();
  const today = new Date();

  if (entries.length === 0) {
    return 'Nothing here yet! Try typing "Spent ₹450 on dinner" or "Income ₹5,000" and I will add it.';
  }

  let scope = entries;
  let period = 'overall';
  if (q.includes('today')) {
    scope = entries.filter((e) => e.date === todayStr());
    period = 'today';
  } else if (q.includes('yesterday')) {
    scope = entries.filter((e) => e.date === daysAgoStr(1, today));
    period = 'yesterday';
  } else if (q.includes('this month')) {
    scope = entries.filter((e) => monthKey(e.date) === monthKey(toDateStr(today)));
    period = 'this month';
  } else if (q.includes('this week') || q.includes('last 7 days')) {
    scope = entries.filter((e) => e.date >= daysAgoStr(6, today));
    period = 'in the last 7 days';
  }
  const s = summarise(scope);

  if (/(summary|overview|report|status|financial health|how am i doing)/.test(q) && !q.includes('budget')) {
    const rateText = s.income > 0 ? '\n• Savings Rate: ' + ((s.net / s.income) * 100).toFixed(1) + '%' : '';
    return 'Here is your ' + period + ' financial snapshot:\n' +
      '• Income: ' + formatINR(s.income) + ' (' + s.count.income + ' entries)\n' +
      '• Expenses: ' + formatINR(s.expense) + ' (' + s.count.expense + ' entries)\n' +
      '• Net Balance: ' + formatINR(s.net) + rateText;
  }

  if (/(safe to spend|daily limit|can i spend|remaining budget|budget left)/.test(q)) {
    const spent = monthlySpendByCategory(entries, today);
    let totalLimit = 0;
    let totalUsed = 0;
    for (const cat in budgets) {
      totalLimit += budgets[cat] || 0;
      totalUsed += spent[cat] || 0;
    }
    const remaining = Math.max(0, totalLimit - totalUsed);
    const daysLeft = Math.max(1, daysInMonth(today) - today.getDate() + 1);
    const perDay = remaining / daysLeft;
    return 'You have ' + formatINR(remaining) + ' left across your monthly budgets with ' + daysLeft + ' days remaining — about ' + formatINR(perDay) + '/day safe to spend.';
  }

  const category = findMentionedCategory(q);
  if (category && /(spend|spent|expense|cost|how much|earn|earned|income|total)/.test(q)) {
    if (INCOME_CAT_NAMES.includes(category)) {
      const earned = s.incomeByCategory[category] || 0;
      return 'You earned ' + formatINR(earned) + ' from ' + category + ' (' + period + ').';
    }
    const amount = s.byCategory[category] || 0;
    const share = s.expense ? Math.round((amount / s.expense) * 100) : 0;
    return 'You spent ' + formatINR(amount) + ' on ' + category + ' (' + period + '), which is ' + share + '% of your total expenses.';
  }

  if (q.includes('saving') && (q.includes('goal') || q.includes('target'))) {
    let percent = 0;
    if (goal.target) {
      percent = Math.round((summarise(entries).net / goal.target) * 100);
      percent = Math.max(0, Math.min(100, percent));
    }
    return 'You are ' + percent + '% of the way to your ' + formatINR(goal.target) + ' savings goal.';
  }

  if (q.includes('saving')) {
    if (!s.income) {
      return 'I cannot calculate your savings rate ' + period + ' because there is no income recorded yet.';
    }
    const rate = (s.net / s.income) * 100;
    const comment = rate >= 20 ? 'Great discipline!' : 'There is room to trim discretionary spending.';
    return 'Your savings rate ' + period + ' is ' + rate.toFixed(1) + '% (' + formatINR(s.net) + ' saved out of ' + formatINR(s.income) + '). ' + comment;
  }

  if (/(latest|last|recent).*(expense|transaction|entry|spend)/.test(q)) {
    const latest = [...scope].sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || 0) - (a.createdAt || 0))[0];
    if (!latest) return 'No entries found for that period.';
    return 'Your latest ' + latest.type + ' was ' + formatINR(latest.amount) + ' for "' + latest.note + '" (' + latest.category + ', ' + formatShortDate(latest.date) + ').';
  }

  if (/(smallest|lowest|minimum|cheapest)/.test(q)) {
    const expenses = scope.filter((e) => e.type === 'expense').sort((a, b) => a.amount - b.amount);
    const low = expenses[0];
    if (!low) return 'No expenses found for that period.';
    return 'Your smallest expense ' + period + ' was ' + formatINR(low.amount) + ' on "' + low.note + '" (' + low.category + ', ' + formatShortDate(low.date) + ').';
  }

  if (/(average|avg)/.test(q)) {
    if (!s.count.expense) return 'No expenses found to average ' + period + '.';
    return 'Your average expense ' + period + ' is ' + formatINR(s.expense / s.count.expense) + ' across ' + s.count.expense + ' entries.';
  }

  if (/(biggest|largest|highest|maximum|most expensive)/.test(q) && !q.includes('categor')) {
    const expenses = scope.filter((e) => e.type === 'expense').sort((a, b) => b.amount - a.amount);
    const top = expenses[0];

    if (!top) return 'I could not find any expenses for that period.';
    return 'Your biggest expense ' + period + ' was ' + formatINR(top.amount) + ' on "' + top.note + '" (' + top.category + ', ' + formatShortDate(top.date) + ').';
  }

  if (/(top|most|biggest|highest).*(categor)|categor.*(most|top)/.test(q)) {
    const list = Object.entries(s.byCategory).sort((a, b) => b[1] - a[1]);

    if (list.length === 0) return 'I could not find any expenses for that period.';
    return list[0][0] + ' is your top spending category ' + period + ' at ' + formatINR(list[0][1]) + '.';
  }

  if (q.includes('budget')) {
    const spent = monthlySpendByCategory(entries, today);
    const parts = [];
    for (const name in budgets) {
      const percent = Math.round(((spent[name] || 0) / budgets[name]) * 100);
      parts.push(name + ' ' + percent + '%');
    }
    return 'Your budgets this month: ' + parts.join(', ') + '.';
  }

  if (q.includes('balance')) {
    return 'Your net balance ' + period + ' is ' + formatINR(s.net) + '.';
  }
  if (q.includes('income') || q.includes('earn')) {
    return 'You earned ' + formatINR(s.income) + ' ' + period + ' across ' + s.count.income + ' entries.';
  }
  if (q.includes('expense') || q.includes('spend') || q.includes('spent')) {
    return 'You spent ' + formatINR(s.expense) + ' ' + period + ' across ' + s.count.expense + ' entries.';
  }

  return 'Try asking "Summary", "How much did I spend on Food?", "Daily safe spend", "Biggest expense?", or log an entry like "Income ₹5,000".';
}