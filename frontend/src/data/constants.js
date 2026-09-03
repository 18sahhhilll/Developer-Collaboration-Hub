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

export const PROJECT_STATUSES = [
  { value: 'recruiting', label: 'Recruiting' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

export const TEAM_SIZE_OPTIONS = [
  { value: '', label: 'Any Size' },
  { value: '3', label: 'Small (1-3)' },
  { value: '5', label: 'Medium (4-5)' },
  { value: '10', label: 'Large (6+)' },
];

export default { SKILL_CATEGORIES, ALL_SKILLS, QUICK_TECH_CHIPS, PROJECT_STATUSES, TEAM_SIZE_OPTIONS };
