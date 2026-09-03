/**
 * Badge system — evaluate and award badges to users.
 * Extensible: add new badge definitions to BADGE_DEFINITIONS.
 * Each badge has an id, title, description, icon, and a check(userId) function.
 */
import Project from '../models/Project.js';
import Application from '../models/Application.js';

export const BADGE_DEFINITIONS = [
  {
    id: 'first_project',
    title: 'First Project',
    description: 'Created your first project',
    icon: '🚀',
    check: async (userId) => {
      const count = await Project.countDocuments({ createdBy: userId });
      return count >= 1;
    },
  },
  {
    id: 'team_player',
    title: 'Team Player',
    description: 'Joined 3 or more projects as a contributor',
    icon: '🤝',
    check: async (userId) => {
      const count = await Project.countDocuments({ members: userId, createdBy: { $ne: userId } });
      return count >= 3;
    },
  },
  {
    id: 'team_leader',
    title: 'Team Leader',
    description: 'Led a team of 3 or more members',
    icon: '⭐',
    check: async (userId) => {
      const projects = await Project.find({ createdBy: userId });
      return projects.some((p) => p.members && p.members.length >= 3);
    },
  },
  {
    id: 'active_member',
    title: 'Active Member',
    description: 'Applied to 5 or more projects',
    icon: '🔥',
    check: async (userId) => {
      const count = await Application.countDocuments({ userId });
      return count >= 5;
    },
  },
  {
    id: 'open_source',
    title: 'Open Source Contributor',
    description: 'Successfully joined an open-source project',
    icon: '💻',
    check: async (userId) => {
      const accepted = await Application.countDocuments({ userId, status: 'accepted' });
      return accepted >= 1;
    },
  },
  {
    id: 'full_stack',
    title: 'Full Stack Developer',
    description: 'Has skills in both frontend and backend technologies',
    icon: '⚡',
    check: async (userId, user) => {
      if (!user) return false;
      const skills = (user.skills || []).map((s) => s.toLowerCase());
      const frontend = ['react', 'vue', 'angular', 'svelte', 'html', 'css', 'tailwind'];
      const backend = ['node', 'express', 'django', 'flask', 'spring', 'laravel', 'rails'];
      const hasFE = frontend.some((f) => skills.some((s) => s.includes(f)));
      const haveBE = backend.some((b) => skills.some((s) => s.includes(b)));
      return hasFE && haveBE;
    },
  },
  {
    id: 'ui_expert',
    title: 'UI Expert',
    description: 'Specialises in frontend and design technologies',
    icon: '🎨',
    check: async (userId, user) => {
      if (!user) return false;
      const skills = (user.skills || []).map((s) => s.toLowerCase());
      const uiSkills = ['figma', 'css', 'tailwind', 'styled-components', 'sass', 'sketch', 'adobe xd', 'framer'];
      return uiSkills.filter((u) => skills.some((s) => s.includes(u))).length >= 2;
    },
  },
];

/**
 * Evaluate all badge criteria for a user and award any new badges.
 * Saves updated badges to user document and returns awarded badges.
 */
export const evaluateAndAwardBadges = async (user) => {
  const existingIds = new Set((user.badges || []).map((b) => b.id));
  const newBadges = [];

  for (const def of BADGE_DEFINITIONS) {
    if (existingIds.has(def.id)) continue;
    try {
      const earned = await def.check(user._id, user);
      if (earned) {
        newBadges.push({
          id: def.id,
          title: def.title,
          description: def.description,
          icon: def.icon,
          earnedAt: new Date(),
        });
      }
    } catch {
      // skip on error
    }
  }

  if (newBadges.length > 0) {
    user.badges = [...(user.badges || []), ...newBadges];
    await user.save();
  }

  return newBadges;
};

export default { BADGE_DEFINITIONS, evaluateAndAwardBadges };
