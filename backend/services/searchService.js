import { expandSearchTerms } from '../utils/searchMappings.js';
import { normalizeSkills } from '../utils/skillsData.js';
import Project from '../models/Project.js';
import Application from '../models/Application.js';

export const ensureTextIndex = async () => {
  try {
    await Project.collection.createIndex(
      {
        title: 'text',
        description: 'text',
        requiredSkills: 'text',
        technologies: 'text',
        category: 'text',
      },
      {
        weights: { title: 10, requiredSkills: 8, technologies: 8, category: 5, description: 3 },
        name: 'project_text_search',
      }
    );
  } catch (error) {
    if (error.code !== 85 && error.code !== 86) {
      console.warn('Text index warning:', error.message);
    }
  }
};

export const searchProjects = async (query, userId, limit = 50) => {
  if (!query?.trim()) return [];

  const expandedTerms = expandSearchTerms(query);
  const searchString = expandedTerms.join(' ');

  let projects = [];

  try {
    projects = await Project.find(
      { $text: { $search: searchString } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .populate('createdBy', 'name role')
      .populate('members', 'name role')
      .lean();
  } catch {
    projects = [];
  }

  if (projects.length === 0) {
    const regexTerms = expandedTerms.map((t) => new RegExp(t, 'i'));
    projects = await Project.find({
      $or: [
        { title: { $in: regexTerms } },
        { description: { $in: regexTerms } },
        { category: { $in: regexTerms } },
        { requiredSkills: { $in: regexTerms } },
        { technologies: { $in: regexTerms } },
      ],
    })
      .limit(limit)
      .populate('createdBy', 'name role')
      .populate('members', 'name role')
      .lean();
  }

  const projectIds = projects.map((p) => p._id);
  const appCounts = await Application.aggregate([
    { $match: { projectId: { $in: projectIds } } },
    { $group: { _id: '$projectId', count: { $sum: 1 } } },
  ]);
  const appCountMap = Object.fromEntries(appCounts.map((a) => [a._id.toString(), a.count]));

  const qLower = query.toLowerCase();
  const ranked = projects.map((project) => {
    let relevance = project.score || 0;
    const title = project.title?.toLowerCase() || '';
    const desc = project.description?.toLowerCase() || '';
    const skills = [...(project.requiredSkills || []), ...(project.technologies || [])].map((s) =>
      s.toLowerCase()
    );

    if (title.includes(qLower)) relevance += 20;
    expandedTerms.forEach((term) => {
      if (title.includes(term)) relevance += 10;
      if (skills.some((s) => s.includes(term))) relevance += 8;
      if (desc.includes(term)) relevance += 3;
    });

    return {
      ...project,
      applicationCount: appCountMap[project._id.toString()] || 0,
      relevanceScore: relevance,
    };
  });

  ranked.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return ranked;
};

export const buildFeedFilter = (query) => {
  const filter = {};
  const { technology, category, teamSize, status } = query;

  if (category) filter.category = category;
  if (status) filter.status = status;
  if (teamSize) {
    const size = parseInt(teamSize, 10);
    if (size <= 3) filter.teamSize = { $lte: 3 };
    else if (size <= 5) filter.teamSize = { $gte: 4, $lte: 5 };
    else filter.teamSize = { $gte: 6 };
  }
  if (technology) {
    const techRegex = new RegExp(technology, 'i');
    filter.$or = [
      { requiredSkills: techRegex },
      { technologies: techRegex },
    ];
  }

  return filter;
};

export const applyListFilters = (projects, query = {}) => {
  const { technology, category, teamSize, status } = query;

  return projects.filter((p) => {
    if (category && p.category !== category) return false;

    if (status) {
      const normalized =
        p.status === 'open' ? 'recruiting' : p.status === 'closed' ? 'archived' : p.status;
      if (normalized !== status && p.status !== status) return false;
    }

    if (teamSize) {
      const size = parseInt(teamSize, 10);
      const ts = p.teamSize || 0;
      if (size <= 3 && ts > 3) return false;
      if (size > 3 && size <= 5 && (ts < 4 || ts > 5)) return false;
      if (size > 5 && ts < 6) return false;
    }

    if (technology) {
      const tech = technology.toLowerCase();
      const skills = [...(p.requiredSkills || []), ...(p.technologies || [])].map((s) =>
        s.toLowerCase()
      );
      if (!skills.some((s) => s.includes(tech))) return false;
    }

    return true;
  });
};

export default { ensureTextIndex, searchProjects, buildFeedFilter, applyListFilters };
