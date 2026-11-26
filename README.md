 💰 Smart Expense Tracker


🔗 **Live demo:** <https://kanakuapp.netlify.app>
📦 **Repo:** <https://github.com/kowsalyadevivijay-cloud/Smart-Expense-Tracker>

**Stack:** ⚛️ React · ⚡ Vite · 🎨 Tailwind CSS v4 · 📈 Recharts · 🧩 Lucide

## ✨ Features

- 📝 **Record entries**: income or expense with amount, category, date and note. Amounts from ₹1,00,000 ask for confirmation ⚠️, and above ₹1,00,00,000 are rejected.
- 🤖 **AI**: type `Spent ₹450 on dinner` and it adds the entry. Ask `Biggest expense?` or `Budget status?` and it answers. It is keyword and regex based (`src/utils/aiParser.js`), so it works offline.
- 🧾 **Scan receipt or SMS**: paste text, review the extracted details, then save. Image upload is demo only (no OCR).
- 🔍 **Filter, search and sort**: by category, type, date, amount or note. Sort by most recent or highest amount. Delete any entry.
- 📊 **Charts**: category donut or bar with totals and percentages, income vs expense cashflow, and trend lines on the summary cards. All update live as entries change.
- 🎯 **Budgets and goal**: monthly limits that turn 🟠 at 75% and 🔴 above 90%, plus a savings goal ring.
- 📤 **Export**: CSV, JSON backup or PDF report, for the current filter or all history.
- 🌗 **Dark and light theme**, remembered between visits.

## 🚀 Quick start

Needs Node.js 20.19+ (or 22.12+) and npm.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build into dist/
```

## 🗂️ Project structure

```
src/
├── App.jsx          state, filtering, layout
├── constants.js     categories, colours, ₹ helpers
├── components/      Header, Sidebar, KpiCards, CopilotCard, charts, modals, lists
├── hooks/           useLocalStorage
└── utils/           aiParser, chartData, exportData, dateUtils,
```
