import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Inbox } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api
      .get('/applications/my')
      .then(({ data }) => setApplications(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === 'all' ? applications : applications.filter((a) => a.status === filter);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Applications</h1>
        <p className="mt-1 text-muted">Track all your project applications</p>
      </div>

      <div className="mb-6 flex gap-2">
        {['all', 'pending', 'accepted', 'rejected'].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${
              filter === f ? 'bg-ink text-white' : 'bg-chrome text-muted hover:text-ink'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card py-16 text-center">
          <Inbox className="mx-auto h-10 w-10 text-muted" />
          <h3 className="mt-4 text-lg font-semibold">No applications</h3>
          <p className="mt-1 text-sm text-muted">
            Browse the{' '}
            <Link to="/feed" className="text-accent hover:underline">
              feed
            </Link>{' '}
            to find projects to apply to.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => (
            <div key={app._id} className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link
                  to={`/projects/${app.projectId?._id}`}
                  className="text-lg font-semibold hover:text-accent"
                >
                  {app.projectId?.title}
                </Link>
                <p className="text-sm text-muted">
                  Applied on {new Date(app.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                {app.message && (
                  <p className="mt-2 text-sm text-muted italic">&ldquo;{app.message}&rdquo;</p>
                )}
              </div>
              <StatusBadge status={app.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applications;
