import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Plus } from 'lucide-react';
import api from '../services/api';
import MyProjectCard from '../components/MyProjectCard';
import LoadingSpinner from '../components/LoadingSpinner';

const WORKSPACE_TABS = [
  { id: 'all', label: 'All' },
  { id: 'created', label: 'Created' },
  { id: 'joined', label: 'Joined' },
  { id: 'completed', label: 'Completed' },
  { id: 'archived', label: 'Archived' },
];

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const fetchWorkspace = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/projects/workspace', {
        params: { filter: activeTab },
      });
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  return (
    <div className="page-container">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Projects</h1>
          <p className="mt-1 text-muted">
            Manage projects you created, joined, and completed
          </p>
        </div>
        <Link to="/projects/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg bg-chrome p-1">
        {WORKSPACE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 rounded-md px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-surface text-ink shadow-card'
                : 'text-muted hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : projects.length === 0 ? (
        <div className="card py-16 text-center">
          <FolderKanban className="mx-auto h-10 w-10 text-muted" />
          <h3 className="mt-4 text-lg font-semibold">
            {activeTab === 'all' ? 'No projects yet' : `No ${activeTab} projects`}
          </h3>
          <p className="mt-1 text-sm text-muted">
            {activeTab === 'all'
              ? 'Create a project or apply to collaborations from the Feed.'
              : 'Projects in this category will appear here.'}
          </p>
          {activeTab === 'all' && (
            <Link to="/projects/new" className="btn-primary mt-6 inline-flex">
              <Plus className="h-4 w-4" />
              Create Project
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {projects.map((project) => (
            <MyProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
