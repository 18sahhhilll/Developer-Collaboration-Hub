import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Clock, CheckCircle, XCircle, Inbox } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [myProjects, setMyProjects] = useState([]);
  const [applications, setApplications] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, projectsRes, appsRes] = await Promise.all([
          api.get('/projects/stats'),
          api.get('/projects/my'),
          api.get('/applications/dashboard'),
        ]);
        setStats(statsRes.data);
        setMyProjects(projectsRes.data);
        setApplications(appsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStatusUpdate = async (appId, status) => {
    try {
      await api.put(`/applications/${appId}/status`, { status });
      const { data } = await api.get('/applications/dashboard');
      setApplications(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update');
    }
  };

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
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-muted">Overview of your projects and applications</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={FolderKanban}
          label="My Projects"
          value={stats?.myProjects || 0}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={Clock}
          label="Pending Applications"
          value={stats?.applications?.pending || 0}
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          icon={CheckCircle}
          label="Accepted"
          value={stats?.applications?.accepted || 0}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          icon={XCircle}
          label="Rejected"
          value={stats?.applications?.rejected || 0}
          color="bg-red-50 text-red-600"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">My Projects</h2>
            <Link to="/projects/new" className="text-sm font-medium text-accent hover:underline">
              Create new
            </Link>
          </div>
          {myProjects.length === 0 ? (
            <div className="card py-10 text-center">
              <FolderKanban className="mx-auto h-8 w-8 text-muted" />
              <p className="mt-2 text-sm text-muted">No projects yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myProjects.slice(0, 5).map((project) => (
                <Link
                  key={project._id}
                  to={`/projects/${project._id}`}
                  className="card flex items-center justify-between !p-4 transition hover:shadow-elevated"
                >
                  <div>
                    <p className="font-medium">{project.title}</p>
                    <p className="text-xs text-muted">
                      {project.members?.length}/{project.teamSize} members
                    </p>
                  </div>
                  <StatusBadge status={project.status} />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">My Applications</h2>
          {!applications?.myApplications?.length ? (
            <div className="card py-10 text-center">
              <Inbox className="mx-auto h-8 w-8 text-muted" />
              <p className="mt-2 text-sm text-muted">No applications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.myApplications.slice(0, 5).map((app) => (
                <div key={app._id} className="card flex items-center justify-between !p-4">
                  <div>
                    <p className="font-medium">{app.projectId?.title}</p>
                    <p className="text-xs text-muted">
                      Applied {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {applications?.incomingApplications?.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">Incoming Applications</h2>
          <div className="space-y-3">
            {applications.incomingApplications.map((app) => (
              <div key={app._id} className="card !p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{app.userId?.name}</p>
                    <p className="text-sm text-muted">
                      Applied to <span className="font-medium">{app.projectId?.title}</span>
                    </p>
                    {app.userId?.skills?.length > 0 && (
                      <p className="mt-1 text-xs text-muted">
                        Skills: {app.userId.skills.join(', ')}
                      </p>
                    )}
                  </div>
                  {app.status === 'pending' ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(app._id, 'accepted')}
                        className="btn-accent !py-1.5 !text-xs"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(app._id, 'rejected')}
                        className="btn-secondary !py-1.5 !text-xs"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <StatusBadge status={app.status} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
