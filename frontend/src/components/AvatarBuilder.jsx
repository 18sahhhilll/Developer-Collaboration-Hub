import { useState } from 'react';
import AvatarRenderer from './AvatarRenderer';
import api from '../services/api';

const STYLES = ['developer', 'minimal', 'pixel', 'cyber', 'professional'];

const HAIR_OPTIONS = ['short', 'long', 'curly', 'bun', 'spiky', 'none'];
const EYES_OPTIONS = ['normal', 'happy', 'wink', 'cool'];
const BEARD_OPTIONS = ['none', 'stubble', 'full', 'goatee'];
const GLASSES_OPTIONS = ['none', 'round', 'square', 'sunglasses'];
const CLOTHES_OPTIONS = ['tshirt', 'hoodie', 'suit', 'dev'];
const SKIN_TONES = ['light', 'medium', 'tan', 'dark', 'deep'];
const HAIR_COLORS = ['black', 'brown', 'blonde', 'red', 'gray', 'white', 'blue', 'purple'];

const BG_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b',
  '#10b981', '#06b6d4', '#3b82f6', '#1e293b', '#334155',
];

const CLOTHES_COLORS = [
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#10b981',
  '#f59e0b', '#ef4444', '#1e293b', '#334155', '#64748b',
];

const Section = ({ label, children }) => (
  <div className="space-y-2">
    <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
    {children}
  </div>
);

const OptionGrid = ({ options, value, onChange, cols = 4 }) => (
  <div className={`grid gap-1.5 grid-cols-${cols}`}>
    {options.map((opt) => (
      <button
        key={opt}
        type="button"
        onClick={() => onChange(opt)}
        className={`rounded-lg border px-2 py-1.5 text-xs font-medium capitalize transition ${
          value === opt
            ? 'border-accent bg-accent/10 text-accent'
            : 'border-border bg-surface text-muted hover:border-accent/50 hover:text-ink'
        }`}
      >
        {opt}
      </button>
    ))}
  </div>
);

const ColorGrid = ({ colors, value, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {colors.map((color) => (
      <button
        key={color}
        type="button"
        onClick={() => onChange(color)}
        style={{ background: color }}
        className={`h-7 w-7 rounded-full border-2 transition ${
          value === color ? 'border-ink scale-110' : 'border-transparent hover:scale-105'
        }`}
        title={color}
      />
    ))}
  </div>
);

const DEFAULT_CONFIG = {
  style: 'developer',
  bgColor: '#6366f1',
  skinTone: 'light',
  hair: 'short',
  hairColor: 'black',
  eyes: 'normal',
  beard: 'none',
  glasses: 'none',
  clothes: 'tshirt',
  clothesColor: '#3b82f6',
};

const AvatarBuilder = ({ initialConfig = {}, onSave, onClose }) => {
  const [config, setConfig] = useState({ ...DEFAULT_CONFIG, ...initialConfig });
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setConfig((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/users/avatar', { avatarConfig: config, useBuiltIn: true });
      onSave?.(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save avatar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Preview */}
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-2xl border border-border bg-chrome/50 p-6">
          <AvatarRenderer avatarConfig={config} name="Preview" size={120} />
        </div>
        <p className="text-xs text-muted">Live Preview</p>
      </div>

      {/* Controls */}
      <div className="flex-1 space-y-5 overflow-y-auto max-h-[480px] pr-1">
        <Section label="Style Collection">
          <OptionGrid options={STYLES} value={config.style} onChange={(v) => set('style', v)} cols={3} />
        </Section>

        <Section label="Background Color">
          <ColorGrid colors={BG_COLORS} value={config.bgColor} onChange={(v) => set('bgColor', v)} />
        </Section>

        <Section label="Skin Tone">
          <OptionGrid options={SKIN_TONES} value={config.skinTone} onChange={(v) => set('skinTone', v)} cols={5} />
        </Section>

        <Section label="Hair Style">
          <OptionGrid options={HAIR_OPTIONS} value={config.hair} onChange={(v) => set('hair', v)} cols={3} />
        </Section>

        <Section label="Hair Color">
          <OptionGrid options={HAIR_COLORS} value={config.hairColor} onChange={(v) => set('hairColor', v)} cols={4} />
        </Section>

        <Section label="Eyes">
          <OptionGrid options={EYES_OPTIONS} value={config.eyes} onChange={(v) => set('eyes', v)} cols={4} />
        </Section>

        <Section label="Beard">
          <OptionGrid options={BEARD_OPTIONS} value={config.beard} onChange={(v) => set('beard', v)} cols={4} />
        </Section>

        <Section label="Glasses">
          <OptionGrid options={GLASSES_OPTIONS} value={config.glasses} onChange={(v) => set('glasses', v)} cols={4} />
        </Section>

        <Section label="Clothes">
          <OptionGrid options={CLOTHES_OPTIONS} value={config.clothes} onChange={(v) => set('clothes', v)} cols={4} />
        </Section>

        <Section label="Clothes Color">
          <ColorGrid colors={CLOTHES_COLORS} value={config.clothesColor} onChange={(v) => set('clothesColor', v)} />
        </Section>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t border-border lg:hidden">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="button" onClick={handleSave} disabled={saving} className="btn-primary flex-1">
          {saving ? 'Saving...' : 'Save Avatar'}
        </button>
      </div>
      <div className="hidden lg:flex lg:flex-col gap-2 self-start pt-2">
        <button type="button" onClick={handleSave} disabled={saving} className="btn-primary whitespace-nowrap">
          {saving ? 'Saving...' : 'Save Avatar'}
        </button>
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
      </div>
    </div>
  );
};

export default AvatarBuilder;
