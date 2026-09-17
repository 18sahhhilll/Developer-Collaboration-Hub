import { Link } from 'react-router-dom';
import { Users, Bookmark, BookmarkCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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
  onWithdraw,
  applying = false,
  applied = false,
  isOwner = false,
  showBookmark = false,
  bookmarked = false,
  onBookmark,
  recommendationReason,
}) => {
  const { user } = useAuth();
  const ownerId = String(project.createdBy?._id || project.createdBy || '');
  const currentUserId = String(user?._id || '');
  const isProjectOwner = isOwner || (ownerId && currentUserId && ownerId === currentUserId);
  const isMember = project.members?.some((m) => String(m._id || m) === currentUserId);

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
          {isProjectOwner ? (
            <Link to={`/projects/${project._id}/edit`} className="btn-primary !py-2 !text-xs">
              Manage Project
            </Link>
          ) : isMember ? (
            <span className="rounded-lg bg-chrome px-3 py-2 text-xs font-medium text-muted">
              Member
            </span>
          ) : (
            showApply &&
              (applied ? (
                <button
                  type="button"
                  onClick={() => onWithdraw?.(project._id)}
                  className="rounded-lg border border-border bg-chrome px-3 py-1.5 text-xs font-medium text-muted transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  title="Click to withdraw application"
                >
                  Applied ✕
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onApply?.(project._id)}
                  disabled={
                    applying ||
                    memberCount >= project.teamSize ||
                    project.status === 'completed' ||
                    project.status === 'archived'
                  }
                  className="btn-accent !py-2 !text-xs disabled:opacity-50"
                >
                  {memberCount >= project.teamSize
                    ? 'Team Full'
                    : project.status === 'completed' || project.status === 'archived'
                    ? 'Closed'
                    : applying
                    ? 'Applying...'
                    : 'Apply'}
                </button>
              ))
          )}
        </div>
      </div>
    </article>
  );
};

export default ProjectCard;
