export const KEYWORD_MAPPINGS = {
  frontend: ['React', 'Angular', 'Vue', 'HTML', 'CSS', 'JavaScript', 'TypeScript', 'Next.js'],
  backend: ['Node.js', 'Express', 'Java', 'Spring Boot', 'Python', 'Django', 'Flask', 'Laravel', 'PHP'],
  mobile: ['Android', 'Kotlin', 'Flutter', 'React Native', 'Swift'],
  database: ['MongoDB', 'MySQL', 'PostgreSQL', 'Redis'],
  cloud: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes'],
  devops: ['Docker', 'Kubernetes', 'Jenkins', 'GitHub Actions', 'DevOps'],
  'ai/ml': ['TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning', 'NLP', 'AI/ML'],
  android: ['Android', 'Kotlin'],
  react: ['React', 'React Native', 'Next.js'],
  node: ['Node.js', 'Express'],
  java: ['Java', 'Spring Boot'],
  python: ['Python', 'Django', 'Flask'],
};

export const expandSearchTerms = (query) => {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const expanded = new Set(terms);

  terms.forEach((term) => {
    Object.entries(KEYWORD_MAPPINGS).forEach(([keyword, skills]) => {
      if (term.includes(keyword) || keyword.includes(term)) {
        skills.forEach((s) => expanded.add(s.toLowerCase()));
        expanded.add(keyword);
      }
    });
    Object.entries(KEYWORD_MAPPINGS).forEach(([keyword, skills]) => {
      if (skills.some((s) => s.toLowerCase().includes(term))) {
        expanded.add(keyword);
        skills.forEach((s) => expanded.add(s.toLowerCase()));
      }
    });
  });

  return [...expanded];
};

export default { KEYWORD_MAPPINGS, expandSearchTerms };
