import { RotateCcw, Search } from 'lucide-react';
import { spotlightMove, spotlightTouchEnd, spotlightTouchStart } from '../utils/spotlight';
import { ALL_CATEGORIES } from '../constants';

function Label({ children }) {
  return <span className="text-[11px] t-muted mb-1 block">{children}</span>;
}

export default function FilterBar({ filters, onChange, onReset }) {

  function handleChange(name) {
    return (event) => onChange({ ...filters, [name]: event.target.value });
  }

  return (
    <div onMouseMove={spotlightMove} onTouchStart={spotlightTouchStart} onTouchMove={spotlightMove} onTouchEnd={spotlightTouchEnd} onTouchCancel={spotlightTouchEnd} className="glass spotlight p-4">
      <div className="relative mb-3">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 t-muted" />
        <input className="field !pl-9" placeholder="Search by note or keyword" aria-label="Search transactions" value={filters.search} onChange={handleChange('search')} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div>
          <Label>Category</Label>
          <select className="field" value={filters.category} onChange={handleChange('category')}>
            <option value="All">All</option>
            {ALL_CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <Label>Type</Label>
          <select className="field" value={filters.type} onChange={handleChange('type')}>
            <option value="all">All</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div>
          <Label>From</Label>
          <input type="date" className="field" value={filters.startDate} onChange={handleChange('startDate')} />
        </div>
        <div>
          <Label>To</Label>
          <input type="date" className="field" value={filters.endDate} onChange={handleChange('endDate')} />
        </div>
        <div>
          <Label>Min ₹</Label>
          <input type="number" min="0" className="field" placeholder="0" value={filters.minAmount} onChange={handleChange('minAmount')} />
        </div>
        <div>
          <Label>Max ₹</Label>
          <input type="number" min="0" className="field" placeholder="Any" value={filters.maxAmount} onChange={handleChange('maxAmount')} />
        </div>
        <div>
          <Label>Sort</Label>
          <select className="field" value={filters.sortBy} onChange={handleChange('sortBy')}>
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Amount</option>
          </select>
        </div>
      </div>

      <button type="button" onClick={onReset} className="mt-3 inline-flex items-center gap-1.5 text-xs t-muted hover:text-emerald-400 cursor-pointer">
        <RotateCcw className="w-3.5 h-3.5" /> Reset filters
      </button>
    </div>
  );
}
