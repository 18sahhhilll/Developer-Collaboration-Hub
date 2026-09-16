/**
 * Badge definitions catalog — single source of truth for all badge metadata.
 *
 * To add a new badge:
 *   1. Add a new entry to BADGE_CATALOG below.
 *   2. Add a matching check() function in backend/services/badgeService.js.
 *   That's it — the Badge component and Profile section render dynamically.
 */

export const BADGE_CATALOG = {
  first_project: {
    id: 'first_project',
    title: 'First Project',
    description: 'Created and completed your first project.',
    icon: '🚀',
  },
  team_player: {
    id: 'team_player',
    title: 'Team Player',
    description: 'Successfully collaborated with other developers on a project.',
    icon: '🤝',
  },
  team_leader: {
    id: 'team_leader',
    title: 'Team Leader',
    description: 'Successfully led a team or project.',
    icon: '⭐',
  },
  bug_hunter: {
    id: 'bug_hunter',
    title: 'Bug Hunter',
    description: 'Found and resolved bugs in projects.',
    icon: '🐛',
  },
  active_member: {
    id: 'active_member',
    title: 'Active Member',
    description: 'Consistently active and engaged on the platform.',
    icon: '🔥',
  },
  open_source: {
    id: 'open_source',
    title: 'Open Source Contributor',
    description: 'Contributed to an open-source project.',
    icon: '💻',
  },
  full_stack: {
    id: 'full_stack',
    title: 'Full Stack Developer',
    description: 'Demonstrated experience across frontend and backend development.',
    icon: '⚡',
  },
  ui_expert: {
    id: 'ui_expert',
    title: 'UI Expert',
    description: 'Demonstrated strong UI/UX and frontend development skills.',
    icon: '🎨',
  },
};

/**
 * Look up a badge definition by id. Returns catalog entry or a fallback
 * constructed from the earned-badge data (for forward-compatibility when
 * the backend awards a badge the frontend catalog doesn't know about yet).
 */
export const getBadgeDefinition = (earnedBadge) => {
  return BADGE_CATALOG[earnedBadge.id] || {
    id: earnedBadge.id,
    title: earnedBadge.title || earnedBadge.id,
    description: earnedBadge.description || '',
    icon: earnedBadge.icon || '🏅',
  };
};

export default BADGE_CATALOG;
