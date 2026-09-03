import Project from '../models/Project.js';
import Application from '../models/Application.js';
import { calculateMatchPercentage } from './matchingService.js';
import { normalizeSkills } from '../utils/skillsData.js';
import { normalizeStatus } from '../utils/statusHelper.js';

const normalize = (arr = []) => arr.map((s) => s.toLowerCase().trim());

export const getUserTechProfile = async (user) => {
  const userId = user._id;
  const userSkills = normalizeSkills(user.skills || []);

  const [joinedProjects, createdProjects, userApplications] = await Promise.all([
    Project.find({ members: userId, createdBy: { $ne: userId } }).select('requiredSkills technologies category'),
    Project.find({ createdBy: userId }).select('requiredSkills technologies category'),
    Application.find({ userId }).populate('projectId', 'category requiredSkills technologies'),
  ]);

  const techSet = new Set(normalize(userSkills));
  const categorySet = new Set();

  [...joinedProjects, ...createdProjects].forEach((p) => {
    [...(p.requiredSkills || []), ...(p.technologies || [])].forEach((t) => techSet.add(t.toLowerCase()));
    if (p.category) categorySet.add(p.category.toLowerCase());
  });

  userApplications.forEach((app) => {
    if (app.projectId?.category) categorySet.add(app.projectId.category.toLowerCase());
  });

  return {
    skills: userSkills,
    technologies: [...techSet],
    categories: [...categorySet],
  };
};

export const buildRecommendationReason = (project, userProfile) => {
  const projectSkills = normalize([
    ...(project.requiredSkills || []),
    ...(project.technologies || []),
  ]);
  const userTech = normalize([...userProfile.skills, ...userProfile.technologies]);

  const matched = projectSkills.filter((s) => userTech.includes(s));
  const uniqueMatched = [...new Set(matched)];

  if (uniqueMatched.length >= 2) {
    const display = uniqueMatched.slice(0, 3).map((s) => {
      const orig = [...(project.requiredSkills || []), ...(project.technologies || [])].find(
        (x) => x.toLowerCase() === s
      );
      return orig || s;
    });
    if (uniqueMatched.length >= 4) {
      return `Matches ${uniqueMatched.length} of your skills`;
    }
    return `Recommended because you know ${display.join(' and ')}`;
  }

  if (uniqueMatched.length === 1) {
    const skill = [...(project.requiredSkills || []), ...(project.technologies || [])].find(
      (x) => x.toLowerCase() === uniqueMatched[0]
    );
    return `Recommended because you know ${skill}`;
  }

  if (project.category && userProfile.categories.includes(project.category.toLowerCase())) {
    return `Recommended based on your interest in ${project.category}`;
  }

  return null;
};

export const scoreProject = (project, userProfile, appCount = 0, recentActivity = 0) => {
  const projectSkills = [...(project.requiredSkills || []), ...(project.technologies || [])];
  const userTech = [...userProfile.skills, ...userProfile.technologies];

  let score = calculateMatchPercentage(userTech, projectSkills);

  const categoryMatch = project.category &&
    userProfile.categories.includes(project.category.toLowerCase());
  if (categoryMatch) score += 15;

  const userTechNorm = normalize(userTech);
  const projectTechNorm = normalize(projectSkills);
  const overlap = projectTechNorm.filter((t) => userProfile.technologies.includes(t));
  score += overlap.length * 5;

  const reason = buildRecommendationReason(project, userProfile);

  return { score, reason, matchPercentage: calculateMatchPercentage(userTech, projectSkills) };
};

export const getRecommendedProjects = async (user, baseFilter = {}) => {
  const userProfile = await getUserTechProfile(user);

  const filter = {
    ...baseFilter,
    status: baseFilter.status || { $in: ['recruiting', 'open', 'in-progress'] },
    createdBy: { $ne: user._id },
  };

  const projects = await Project.find(filter)
    .populate('createdBy', 'name role')
    .populate('members', 'name role')
    .lean();

  const projectIds = projects.map((p) => p._id);
  const appCounts = await Application.aggregate([
    { $match: { projectId: { $in: projectIds } } },
    { $group: { _id: '$projectId', count: { $sum: 1 } } },
  ]);
  const appCountMap = Object.fromEntries(appCounts.map((a) => [a._id.toString(), a.count]));

  const scored = projects.map((project) => {
    const { score, reason, matchPercentage } = scoreProject(
      project,
      userProfile,
      appCountMap[project._id.toString()] || 0
    );
    return {
      ...project,
      status: normalizeStatus(project.status),
      recommendationScore: score,
      recommendationReason: reason,
      matchPercentage,
      applicationCount: appCountMap[project._id.toString()] || 0,
    };
  });

  scored.sort((a, b) => b.recommendationScore - a.recommendationScore);
  return scored;
};

export const getTrendingProjects = async (user, baseFilter = {}) => {
  const filter = {
    ...baseFilter,
    status: baseFilter.status || { $in: ['recruiting', 'open', 'in-progress'] },
  };

  const projects = await Project.find(filter)
    .populate('createdBy', 'name role')
    .populate('members', 'name role')
    .lean();

  const projectIds = projects.map((p) => p._id);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [appCounts, recentApps] = await Promise.all([
    Application.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      { $group: { _id: '$projectId', count: { $sum: 1 } } },
    ]),
    Application.aggregate([
      { $match: { projectId: { $in: projectIds }, createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: '$projectId', count: { $sum: 1 } } },
    ]),
  ]);

  const appCountMap = Object.fromEntries(appCounts.map((a) => [a._id.toString(), a.count]));
  const recentMap = Object.fromEntries(recentApps.map((a) => [a._id.toString(), a.count]));

  const userProfile = await getUserTechProfile(user);

  const scored = projects.map((project) => {
    const appCount = appCountMap[project._id.toString()] || 0;
    const recentCount = recentMap[project._id.toString()] || 0;
    const memberActivity = project.members?.length || 0;
    const trendingScore = appCount * 2 + recentCount * 5 + memberActivity;

    const { matchPercentage, reason } = scoreProject(project, userProfile, appCount);

    return {
      ...project,
      status: normalizeStatus(project.status),
      trendingScore,
      applicationCount: appCount,
      matchPercentage,
      recommendationReason: reason,
    };
  });

  scored.sort((a, b) => b.trendingScore - a.trendingScore);
  return scored;
};

export const getLatestProjects = async (user, baseFilter = {}) => {
  const filter = {
    ...baseFilter,
    status: baseFilter.status || { $in: ['recruiting', 'open', 'in-progress'] },
  };

  const projects = await Project.find(filter)
    .populate('createdBy', 'name role')
    .populate('members', 'name role')
    .sort({ createdAt: -1 })
    .lean();

  const userProfile = await getUserTechProfile(user);

  return projects.map((project) => {
    const { matchPercentage, reason } = scoreProject(project, userProfile);
    return {
      ...project,
      status: normalizeStatus(project.status),
      matchPercentage,
      recommendationReason: reason,
    };
  });
};

export default {
  getUserTechProfile,
  getRecommendedProjects,
  getTrendingProjects,
  getLatestProjects,
  buildRecommendationReason,
};
