import { Link } from 'react-router-dom';
import { Users, Bookmark, BookmarkCheck, Sparkles } from 'lucide-react';
import SkillTags from './SkillTags';
import StatusBadge from './StatusBadge';

const MatchBadge = ({ percentage }) => {
  let colorClass = 'bg-red-50 text-red-700';
  if (percentage >= 70) colorClass = 'bg-green-50 text-green-700';
  else if (percentage >= 40) colorClass = 'bg-amber-50 text-amber-700';

  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}>
      {percentage}% match
    </span>
  );
};

const ProjectCard = ({
  project,
  showApply = true,
  onApply,
  applying = false,
  applied = false,
  isOwner = false,
  showBookmark = false,
  bookmarked = false,
  onBookmark,
  recommendationReason,
}) => {
  const memberCount = project.members?.length || 0;
  const skills = project.requiredSkills?.length
    ? project.requiredSkills
    : project.technologies;

  return (
    <article className="card flex flex-col gap-4 transition hover:shadow-elevated">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Link
              to={`/projects/${project._id}`}
              className="text-lg font-semibold text-ink hover:text-accent"
            >
              {project.title}
            </Link>
            {project.status && <StatusBadge status={project.status} />}
            {project.matchPercentage !== undefined && (
              <MatchBadge percentage={project.matchPercentage} />
            )}
          </div>
          {project.category && (
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              {project.category}
            </span>
          )}
        </div>
        {showBookmark && !isOwner && (
          <button
            type="button"
            onClick={() => onBookmark?.(project._id)}
            className="rounded-lg p-1.5 text-muted transition hover:bg-chrome hover:text-accent"
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            {bookmarked ? (
              <BookmarkCheck className="h-4 w-4 text-accent" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {recommendationReason && (
        <p className="flex items-center gap-1.5 text-xs text-accent">
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          {recommendationReason}
        </p>
      )}

      <p className="line-clamp-3 text-sm leading-relaxed text-muted">{project.description}</p>

      {skills?.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Required Skills
          </p>
          <SkillTags skills={skills} />
        </div>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {memberCount}/{project.teamSize} members
          </span>
          {project.createdBy?.name && <span>by {project.createdBy.name}</span>}
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/projects/${project._id}`} className="btn-secondary !py-2 !text-xs">
            View
          </Link>
          {isOwner ? (
            <Link to={`/projects/${project._id}/edit`} className="btn-primary !py-2 !text-xs">
              Manage Project
            </Link>
          ) : (
            showApply && (
              <button
                type="button"
                onClick={() => onApply?.(project._id)}
                disabled={applying || applied || project.status === 'completed' || project.status === 'archived'}
                className="btn-accent !py-2 !text-xs"
              >
                {applied ? 'Applied' : applying ? 'Applying...' : 'Apply'}
              </button>
            )
          )}
        </div>
      </div>
    </article>
  );
};

export default ProjectCard;
