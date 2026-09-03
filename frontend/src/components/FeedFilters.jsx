import { QUICK_TECH_CHIPS, PROJECT_STATUSES, TEAM_SIZE_OPTIONS } from '../data/constants';

const categories = ['General', 'Web', 'Mobile', 'AI/ML', 'DevOps', 'Open Source', 'Blockchain'];

const FeedFilters = ({ filters, onChange }) => {
  const set = (key, value) => {
    onChange({ ...filters, [key]: filters[key] === value ? '' : value });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Technology</span>
        {QUICK_TECH_CHIPS.map((tech) => (
          <button
            key={tech}
            type="button"
            onClick={() => set('technology', tech)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filters.technology === tech
                ? 'bg-ink text-white'
                : 'bg-chrome text-muted hover:text-ink'
            }`}
          >
            {tech}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="feed-category" className="text-xs font-semibold uppercase tracking-wide text-muted">
            Category
          </label>
          <select
            id="feed-category"
            value={filters.category || ''}
            onChange={(e) => onChange({ ...filters, category: e.target.value })}
            className="input-field !w-auto !py-1.5 text-xs"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="feed-team-size" className="text-xs font-semibold uppercase tracking-wide text-muted">
            Team Size
          </label>
          <select
            id="feed-team-size"
            value={filters.teamSize || ''}
            onChange={(e) => onChange({ ...filters, teamSize: e.target.value })}
            className="input-field !w-auto !py-1.5 text-xs"
          >
            {TEAM_SIZE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="feed-status" className="text-xs font-semibold uppercase tracking-wide text-muted">
            Status
          </label>
          <select
            id="feed-status"
            value={filters.status || ''}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
            className="input-field !w-auto !py-1.5 text-xs"
          >
            <option value="">All Statuses</option>
            {PROJECT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {(filters.technology || filters.category || filters.teamSize || filters.status) && (
          <button
            type="button"
            onClick={() => onChange({ technology: '', category: '', teamSize: '', status: '' })}
            className="text-xs font-medium text-accent hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
};

export default FeedFilters;
