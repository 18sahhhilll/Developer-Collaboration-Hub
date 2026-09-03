import { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import api from '../services/api';
import { ALL_SKILLS } from '../data/constants';

const SkillAutocomplete = ({ value = [], onChange, placeholder = 'Search and add skills...' }) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selectedSet = new Set(value.map((s) => s.toLowerCase()));

  const fetchSuggestions = useCallback(async (q) => {
    if (!q.trim()) {
      setSuggestions(ALL_SKILLS.filter((s) => !selectedSet.has(s.toLowerCase())).slice(0, 8));
      return;
    }
    try {
      const { data } = await api.get('/skills', { params: { q } });
      setSuggestions(data.filter((s) => !selectedSet.has(s.toLowerCase())));
    } catch {
      const filtered = ALL_SKILLS.filter(
        (s) => s.toLowerCase().includes(q.toLowerCase()) && !selectedSet.has(s.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 8));
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
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIndex >= 0 && suggestions[highlightIndex]) {
        addSkill(suggestions[highlightIndex]);
      } else if (input.trim()) {
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
          onChange={(e) => { setInput(e.target.value); setOpen(true); setHighlightIndex(-1); }}
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
                  index === highlightIndex ? 'bg-chrome' : ''
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
