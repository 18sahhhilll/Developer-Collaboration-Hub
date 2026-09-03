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

export const searchSkills = (query, limit = 10) => {
  if (!query?.trim()) return ALL_SKILLS.slice(0, limit);
  const q = query.toLowerCase();
  return ALL_SKILLS.filter((s) => s.toLowerCase().includes(q)).slice(0, limit);
};

export default { SKILL_CATEGORIES, ALL_SKILLS, QUICK_TECH_CHIPS, normalizeSkill, normalizeSkills, searchSkills };
