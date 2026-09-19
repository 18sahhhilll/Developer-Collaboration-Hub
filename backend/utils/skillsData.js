export const SKILL_CATEGORIES = {
  Frontend: [
    'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Angular', 'Vue',
  ],
  Backend: [
    'Node.js', 'Express', 'Java', 'Spring Boot', 'Python', 'Django', 'Flask', 'PHP', 'Laravel',
  ],
  Mobile: ['Android', 'Kotlin', 'Flutter', 'React Native', 'Swift'],
  Database: ['MongoDB', 'MySQL', 'PostgreSQL', 'Redis'],
  Cloud: ['AWS', 'Azure', 'GCP'],
  DevOps: ['Docker', 'Kubernetes', 'Jenkins', 'GitHub Actions'],
  'AI/ML': ['TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning', 'NLP'],
};

export const ALL_SKILLS = Object.values(SKILL_CATEGORIES).flat();

export const QUICK_TECH_CHIPS = [
  'React', 'Angular', 'Vue', 'Node.js', 'Java', 'Spring Boot', 'Python', 'Django',
  'Flutter', 'Android', 'MongoDB', 'PostgreSQL', 'AI/ML', 'Cloud', 'DevOps',
];

export const normalizeSkill = (skill) => {
  if (!skill) return '';
  const trimmed = skill.trim();
  const found = ALL_SKILLS.find((s) => s.toLowerCase() === trimmed.toLowerCase());
  return found || trimmed;
};

export const normalizeSkills = (skills = []) => {
  const seen = new Set();
  return skills
    .map(normalizeSkill)
    .filter((s) => {
      const key = s.toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

export const editDistance = (a, b) => {
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

export const searchSkills = (query, limit = 10) => {
  if (!query?.trim()) return ALL_SKILLS.slice(0, limit);
  const q = query.trim().toLowerCase();

  const scored = ALL_SKILLS.map((skill) => {
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

export default { SKILL_CATEGORIES, ALL_SKILLS, QUICK_TECH_CHIPS, normalizeSkill, normalizeSkills, searchSkills, editDistance };
