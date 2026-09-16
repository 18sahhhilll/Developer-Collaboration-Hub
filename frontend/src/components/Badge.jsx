import { getBadgeDefinition } from '../data/badges';

/**
 * Reusable Badge card component.
 *
 * Props:
 *   badge — an earned-badge object from the API: { id, title?, description?, icon?, earnedAt }
 *
 * The component resolves full badge metadata from the centralized catalog,
 * so it stays in sync even if the API returns minimal data.
 */
const Badge = ({ badge }) => {
  const def = getBadgeDefinition(badge);

  const formattedDate = badge.earnedAt
    ? new Date(badge.earnedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div className="rounded-lg border border-border bg-chrome/50 p-4 transition hover:shadow-card">
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none" role="img" aria-label={def.title}>
          {def.icon}
        </span>
        <div className="min-w-0">
          <p className="font-semibold leading-tight">{def.title}</p>
          <p className="mt-0.5 text-sm leading-snug text-muted">{def.description}</p>
          {formattedDate && (
            <p className="mt-1.5 text-xs text-muted/70">Earned {formattedDate}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Badge;
