import { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import api from '../services/api';
import { ALL_SKILLS } from '../data/constants';

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

const searchSkillsLocal = (skillsList, query, limit = 8) => {
  if (!query || !query.trim()) return skillsList.slice(0, limit);
  const q = query.trim().toLowerCase();

  const scored = skillsList.map((skill) => {
    const s = skill.toLowerCase();
    if (s === q) return { skill, score: 0 };
    if (s.startsWith(q)) return { skill, score: 1 + (s.length - q.length) * 0.1 };
    if (s.includes(q)) return { skill, score: 5 + (s.length - q.length) * 0.1 };

    if (q.length >= 2) {
      const dist = editDistance(q, s);
      const maxAllowed = q.length <= 3 ? 1 : q.length <= 5 ? 2 : 3;
      if (dist <= maxAllowed) {
        return { skill, score: 10 + dist };
      }
    }
    return { skill, score: 999 };
  });

  return scored
    .filter((item) => item.score < 999)
    .sort((a, b) => a.score - b.score)
    .map((item) => item.skill)
    .slice(0, limit);
};

const SkillAutocomplete = ({ value = [], onChange, placeholder = 'Search and add skills...' }) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selectedSet = new Set(value.map((s) => s.toLowerCase()));

  const fetchSuggestions = useCallback(async (q) => {
    if (!q.trim()) {
      const available = ALL_SKILLS.filter((s) => !selectedSet.has(s.toLowerCase())).slice(0, 8);
      setSuggestions(available);
      setHighlightIndex(available.length > 0 ? 0 : -1);
      return;
    }
    try {
      const { data } = await api.get('/skills', { params: { q } });
      const filtered = (Array.isArray(data) ? data : data.all || []).filter(
        (s) => !selectedSet.has(s.toLowerCase())
      );
      // Ensure local fuzzy search is applied if API response lacks fuzzy matches
      const merged = filtered.length > 0
        ? filtered
        : searchSkillsLocal(ALL_SKILLS, q).filter((s) => !selectedSet.has(s.toLowerCase()));

      setSuggestions(merged.slice(0, 8));
      setHighlightIndex(merged.length > 0 ? 0 : -1);
    } catch {
      const filtered = searchSkillsLocal(ALL_SKILLS, q).filter((s) => !selectedSet.has(s.toLowerCase()));
      setSuggestions(filtered.slice(0, 8));
      setHighlightIndex(filtered.length > 0 ? 0 : -1);
    }
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

  useEffect(() => {
    if (open) fetchSuggestions(input);
  }, [input, open, fetchSuggestions]);

  const addSkill = (skill) => {
    if (!skill || selectedSet.has(skill.toLowerCase())) return;
    onChange([...value, skill]);
    setInput('');
    setHighlightIndex(-1);
    setOpen(false);
  };

  const removeSkill = (skill) => {
    onChange(value.filter((s) => s !== skill));
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
      if (suggestions.length > 0) {
        e.preventDefault();
        const targetIndex = highlightIndex >= 0 && highlightIndex < suggestions.length ? highlightIndex : 0;
        addSkill(suggestions[targetIndex]);
      } else if (input.trim()) {
        e.preventDefault();
        addSkill(input.trim());
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Backspace' && !input && value.length) {
      removeSkill(value[value.length - 1]);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex min-h-[42px] flex-wrap gap-1.5 rounded-lg border border-border bg-surface px-2 py-2 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
        {value.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1 rounded-md bg-chrome px-2.5 py-0.5 text-xs font-medium"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="text-muted hover:text-ink"
              aria-label={`Remove ${skill}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="min-w-[120px] flex-1 border-0 bg-transparent px-1 py-0.5 text-sm outline-none"
          placeholder={value.length ? '' : placeholder}
        />
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-surface shadow-elevated">
          {suggestions.map((skill, index) => (
            <li key={skill}>
              <button
                type="button"
                onClick={() => addSkill(skill)}
                className={`w-full px-3 py-2 text-left text-sm transition hover:bg-chrome ${
                  index === highlightIndex ? 'bg-chrome font-semibold text-accent' : ''
                }`}
              >
                {skill}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SkillAutocomplete;
