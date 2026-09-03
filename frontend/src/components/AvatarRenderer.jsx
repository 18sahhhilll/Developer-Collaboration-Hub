/**
 * AvatarRenderer — generates an SVG avatar from avatarConfig.
 * Falls back to avatarUrl (Google/GitHub) or initials.
 */

// Skin tone palette
const SKIN_TONES = {
  light: '#FFD5B5',
  medium: '#E8A97E',
  tan: '#C68642',
  dark: '#8D5524',
  deep: '#4A2912',
};

// Hair color palette
const HAIR_COLORS = {
  black: '#1a1a1a',
  brown: '#6B3F2A',
  blonde: '#D4B483',
  red: '#A0522D',
  gray: '#9E9E9E',
  white: '#F5F5F5',
  blue: '#3B82F6',
  purple: '#8B5CF6',
};

// Hair styles (SVG path data)
const HAIR_STYLES = {
  short: (color) => `<ellipse cx="50" cy="28" rx="22" ry="14" fill="${color}"/>`,
  long: (color) => `<ellipse cx="50" cy="28" rx="22" ry="14" fill="${color}"/><rect x="28" y="32" width="8" height="30" rx="4" fill="${color}"/><rect x="64" y="32" width="8" height="30" rx="4" fill="${color}"/>`,
  curly: (color) => `<ellipse cx="50" cy="27" rx="23" ry="15" fill="${color}"/><circle cx="30" cy="32" r="6" fill="${color}"/><circle cx="70" cy="32" r="6" fill="${color}"/>`,
  bun: (color) => `<ellipse cx="50" cy="30" rx="22" ry="12" fill="${color}"/><circle cx="50" cy="18" r="8" fill="${color}"/>`,
  none: () => ``,
  spiky: (color) => `<ellipse cx="50" cy="30" rx="22" ry="12" fill="${color}"/>
    <polygon points="35,25 38,10 41,25" fill="${color}"/>
    <polygon points="43,23 47,7 51,23" fill="${color}"/>
    <polygon points="52,23 56,7 60,23" fill="${color}"/>
    <polygon points="60,25 63,10 66,25" fill="${color}"/>`,
};

// Eye styles
const EYE_STYLES = {
  normal: (skin) => `
    <ellipse cx="41" cy="48" rx="4" ry="4.5" fill="white"/>
    <circle cx="41" cy="48" r="2.5" fill="#1a1a1a"/>
    <ellipse cx="59" cy="48" rx="4" ry="4.5" fill="white"/>
    <circle cx="59" cy="48" r="2.5" fill="#1a1a1a"/>`,
  happy: () => `
    <path d="M37,46 Q41,51 45,46" stroke="#1a1a1a" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M55,46 Q59,51 63,46" stroke="#1a1a1a" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  wink: () => `
    <ellipse cx="41" cy="48" rx="4" ry="4.5" fill="white"/>
    <circle cx="41" cy="48" r="2.5" fill="#1a1a1a"/>
    <path d="M55,48 Q59,53 63,48" stroke="#1a1a1a" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  cool: () => `
    <rect x="36" y="45" width="10" height="7" rx="2" fill="#1a1a1a"/>
    <rect x="54" y="45" width="10" height="7" rx="2" fill="#1a1a1a"/>`,
};

// Glasses styles
const GLASSES_STYLES = {
  none: () => ``,
  round: () => `
    <circle cx="41" cy="48" r="8" stroke="#555" stroke-width="2" fill="none"/>
    <circle cx="59" cy="48" r="8" stroke="#555" stroke-width="2" fill="none"/>
    <line x1="49" y1="48" x2="51" y2="48" stroke="#555" stroke-width="2"/>`,
  square: () => `
    <rect x="33" y="42" width="16" height="12" rx="2" stroke="#555" stroke-width="2" fill="none"/>
    <rect x="51" y="42" width="16" height="12" rx="2" stroke="#555" stroke-width="2" fill="none"/>
    <line x1="49" y1="48" x2="51" y2="48" stroke="#555" stroke-width="2"/>`,
  sunglasses: () => `
    <rect x="33" y="43" width="16" height="10" rx="5" fill="#1a1a1a"/>
    <rect x="51" y="43" width="16" height="10" rx="5" fill="#1a1a1a"/>
    <line x1="49" y1="48" x2="51" y2="48" stroke="#555" stroke-width="2"/>`,
};

// Beard styles
const BEARD_STYLES = {
  none: () => ``,
  stubble: (color) => `<ellipse cx="50" cy="65" rx="14" ry="6" fill="${color}" opacity="0.5"/>`,
  full: (color) => `<ellipse cx="50" cy="67" rx="16" ry="9" fill="${color}"/>`,
  goatee: (color) => `<ellipse cx="50" cy="67" rx="8" ry="7" fill="${color}"/>`,
};

// Clothes styles
const CLOTHES_STYLES = {
  tshirt: (color) => `<path d="M15,100 L25,80 L40,90 L60,90 L75,80 L85,100 Z" fill="${color}"/>`,
  hoodie: (color) => `<path d="M15,100 L22,78 L35,88 L50,82 L65,88 L78,78 L85,100 Z" fill="${color}"/><path d="M42,82 L50,75 L58,82" fill="${color}"/>`,
  suit: (color) => `
    <path d="M20,100 L28,80 L50,90 L72,80 L80,100 Z" fill="${color}"/>
    <path d="M40,80 L50,95 L60,80" fill="white"/>
    <line x1="50" y1="85" x2="50" y2="100" stroke="#888" stroke-width="1.5"/>`,
  dev: (color) => `
    <path d="M18,100 L26,80 L42,88 L58,88 L74,80 L82,100 Z" fill="${color}"/>
    <text x="50" y="95" font-size="8" text-anchor="middle" fill="white" font-family="monospace">&lt;/&gt;</text>`,
};

// Style collections — tints the background + applies a slight theme
const STYLE_THEMES = {
  developer: { prefix: 'DEV', fontMono: true },
  minimal: { prefix: '', fontMono: false },
  pixel: { prefix: '', fontMono: false, pixelate: true },
  cyber: { prefix: 'SYS', fontMono: true, neon: true },
  professional: { prefix: '', fontMono: false },
};

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
  accessory: 'none',
};

const generateAvatarSVG = (config = {}) => {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const skinColor = SKIN_TONES[cfg.skinTone] || SKIN_TONES.light;
  const hairColor = HAIR_COLORS[cfg.hairColor] || HAIR_COLORS.black;
  const theme = STYLE_THEMES[cfg.style] || STYLE_THEMES.developer;

  const hairSVG = HAIR_STYLES[cfg.hair] ? HAIR_STYLES[cfg.hair](hairColor) : HAIR_STYLES.short(hairColor);
  const eyesSVG = EYE_STYLES[cfg.eyes] ? EYE_STYLES[cfg.eyes](skinColor) : EYE_STYLES.normal(skinColor);
  const glassesSVG = GLASSES_STYLES[cfg.glasses] ? GLASSES_STYLES[cfg.glasses]() : '';
  const beardSVG = BEARD_STYLES[cfg.beard] ? BEARD_STYLES[cfg.beard](hairColor) : '';
  const clothesSVG = CLOTHES_STYLES[cfg.clothes] ? CLOTHES_STYLES[cfg.clothes](cfg.clothesColor) : CLOTHES_STYLES.tshirt(cfg.clothesColor);

  const neonFilter = theme.neon ? `
    <defs>
      <filter id="neon">
        <feGaussianBlur stdDeviation="2" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    ${neonFilter}
    <!-- Background -->
    <circle cx="50" cy="50" r="50" fill="${cfg.bgColor}"/>
    
    <!-- Hair (behind face) -->
    ${hairSVG}
    
    <!-- Face -->
    <ellipse cx="50" cy="52" rx="20" ry="23" fill="${skinColor}"/>
    
    <!-- Eyes -->
    ${eyesSVG}
    
    <!-- Nose -->
    <ellipse cx="50" cy="57" rx="2" ry="1.5" fill="${skinColor}" stroke="${hairColor}33" stroke-width="1"/>
    
    <!-- Mouth (smile) -->
    <path d="M44,63 Q50,69 56,63" stroke="#c0725a" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    
    <!-- Beard -->
    ${beardSVG}
    
    <!-- Glasses (on top of eyes) -->
    ${glassesSVG}
    
    <!-- Clothes (bottom clipped by circle) -->
    <clipPath id="clip"><circle cx="50" cy="50" r="50"/></clipPath>
    <g clip-path="url(#clip)">
      ${clothesSVG}
    </g>
  </svg>`;
};

/**
 * AvatarRenderer — React component.
 * Props:
 *  - avatarConfig: object from user.avatarConfig
 *  - avatarUrl: string URL (Google/GitHub photo)
 *  - name: string (used for fallback initials)
 *  - size: number (pixels, default 40)
 *  - className: string
 */
const AvatarRenderer = ({ avatarConfig, avatarUrl, name, size = 40, className = '' }) => {
  const style = { width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 };

  // Use external URL if available (Google/GitHub) and no custom config override
  if (avatarUrl && (!avatarConfig || avatarConfig.style === 'url')) {
    return (
      <img
        src={avatarUrl}
        alt={name || 'Avatar'}
        style={style}
        className={className}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    );
  }

  // Use built-in SVG avatar
  if (avatarConfig) {
    const svg = generateAvatarSVG(avatarConfig);
    return (
      <div
        style={style}
        className={className}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  }

  // Fallback: initials
  const initial = name?.charAt(0)?.toUpperCase() || '?';
  const bg = avatarConfig?.bgColor || '#6366f1';
  return (
    <div
      style={{ ...style, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 700, color: 'white' }}
      className={className}
    >
      {initial}
    </div>
  );
};

export { generateAvatarSVG };
export default AvatarRenderer;
