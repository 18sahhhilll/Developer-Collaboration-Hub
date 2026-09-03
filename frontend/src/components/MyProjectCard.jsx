import { Link } from 'react-router-dom';
import { Users, MessageSquare, Settings } from 'lucide-react';
import SkillTags from './SkillTags';
import StatusBadge from './StatusBadge';

const MyProjectCard = ({ project }) => {
  const memberCount = project.members?.length || 0;
  const isOwner = project.participationRole === 'created';
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
            <StatusBadge status={project.status} />
            <span className="rounded-full bg-chrome px-2.5 py-0.5 text-xs font-medium capitalize text-muted">
              {project.participationRole === 'created' ? 'Created' : 'Joined'}
            </span>
          </div>
          {project.category && (
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              {project.category}
            </span>
          )}
        </div>
      </div>

      <p className="line-clamp-2 text-sm leading-relaxed text-muted">{project.description}</p>

      {skills?.length > 0 && <SkillTags skills={skills.slice(0, 6)} />}

      <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {memberCount}/{project.teamSize} members
          </span>
          <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/projects/${project._id}`} className="btn-secondary !py-2 !text-xs">
            View
          </Link>
          {isOwner ? (
            <Link to={`/projects/${project._id}/edit`} className="btn-primary !py-2 !text-xs">
              <Settings className="h-3.5 w-3.5" />
              Manage
            </Link>
          ) : (
            <Link to={`/chat/${project._id}`} className="btn-primary !py-2 !text-xs">
              <MessageSquare className="h-3.5 w-3.5" />
              Chat
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};

export default MyProjectCard;
