import { useState, useEffect, useRef } from 'react';
import { DEVELOPER_ROLES } from '../data/constants';

const editDistance = (a, b) => {
  const sa = a.toLowerCase();
  const sb = b.toLowerCase();
  const matrix = Array.from({ length: sa.length + 1 }, () => Array(sb.length + 1).fill(0));
  for (let i = 0; i <= sa.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= sb.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= sa.length; i++) {
    for (let j = 1; j <= sb.length; j++) {
      const cost = sa[i - 1] === sb[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[sa.length][sb.length];
};

const filterRoles = (query, limit = 8) => {
  if (!query || !query.trim()) return DEVELOPER_ROLES.slice(0, limit);
  const q = query.trim().toLowerCase();

  const scored = DEVELOPER_ROLES.map((role) => {
    const r = role.toLowerCase();
    if (r === q) return { role, score: 0 };
    if (r.startsWith(q)) return { role, score: 1 + (r.length - q.length) * 0.1 };
    if (r.includes(q)) return { role, score: 5 + (r.length - q.length) * 0.1 };

    if (q.length >= 2) {
      const dist = editDistance(q, r);
      const maxAllowed = q.length <= 3 ? 1 : q.length <= 5 ? 2 : 3;
      if (dist <= maxAllowed) {
        return { role, score: 10 + dist };
      }
    }
    return { role, score: 999 };
  });

  return scored
    .filter((item) => item.score < 999)
    .sort((a, b) => a.score - b.score)
    .map((item) => item.role)
    .slice(0, limit);
};

const RoleAutocomplete = ({ value = '', onChange, placeholder = 'e.g. Full Stack Developer' }) => {
  const [input, setInput] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setInput(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    onChange(val);
    const matches = filterRoles(val);
    setSuggestions(matches);
    setHighlightIndex(matches.length > 0 ? 0 : -1);
    setOpen(true);
  };

  const selectRole = (role) => {
    setInput(role);
    onChange(role);
    setOpen(false);
    setHighlightIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (e.key === 'Tab' && !open) return;
      if (open && suggestions.length > 0) {
        e.preventDefault();
        const targetIndex = highlightIndex >= 0 && highlightIndex < suggestions.length ? highlightIndex : 0;
        selectRole(suggestions[targetIndex]);
      } else if (open) {
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleFocus = () => {
    const matches = filterRoles(input);
    setSuggestions(matches);
    setHighlightIndex(matches.length > 0 ? 0 : -1);
    setOpen(true);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="input-field"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-surface shadow-elevated">
          {suggestions.map((role, index) => (
            <li key={role}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectRole(role);
                }}
                className={`w-full px-3 py-2 text-left text-sm transition hover:bg-chrome ${
                  index === highlightIndex ? 'bg-chrome font-semibold text-accent' : ''
                }`}
              >
                {role}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RoleAutocomplete;
