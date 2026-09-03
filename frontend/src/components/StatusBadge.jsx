const STATUS_LABELS = {
  recruiting: 'Recruiting',
  open: 'Recruiting',
  'in-progress': 'In Progress',
  completed: 'Completed',
  archived: 'Archived',
  closed: 'Archived',
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

const StatusBadge = ({ status }) => {
  const styles = {
    recruiting: 'bg-blue-50 text-blue-700',
    open: 'bg-blue-50 text-blue-700',
    pending: 'bg-amber-50 text-amber-700',
    accepted: 'bg-green-50 text-green-700',
    rejected: 'bg-red-50 text-red-700',
    'in-progress': 'bg-purple-50 text-purple-700',
    completed: 'bg-green-50 text-green-700',
    archived: 'bg-zinc-100 text-zinc-600',
    closed: 'bg-zinc-100 text-zinc-600',
  };

  const normalized = status === 'open' ? 'recruiting' : status === 'closed' ? 'archived' : status;

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[normalized] || 'bg-chrome text-muted'}`}
    >
      {STATUS_LABELS[normalized] || status}
    </span>
  );
};

export default StatusBadge;
