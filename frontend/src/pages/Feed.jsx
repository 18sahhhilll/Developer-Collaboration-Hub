import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProjectCard from '../components/ProjectCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import FeedFilters from '../components/FeedFilters';

const FEED_TABS = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'latest', label: 'Latest' },
  { id: 'trending', label: 'Trending' },
];

const Feed = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [ownedIds, setOwnedIds] = useState(new Set());
  const [bookmarks, setBookmarks] = useState(new Set());
  const [applyModal, setApplyModal] = useState(null);
  const [applyMessage, setApplyMessage] = useState('');
  const [activeTab, setActiveTab] = useState('recommended');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef(null);
  const [filters, setFilters] = useState({
    technology: '',
    category: '',
    teamSize: '',
    status: '',
  });

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const params = { tab: activeTab, ...filters };
      if (debouncedSearch) params.q = debouncedSearch;
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);

      const [projectsRes, appsRes, bookmarksRes, myProjectsRes] = await Promise.all([
        api.get('/projects/feed', { params }),
        api.get('/applications/my'),
        api.get('/users/bookmarks'),
        api.get('/projects/my'),
      ]);

      setProjects(projectsRes.data);
      setAppliedIds(new Set(appsRes.data.map((a) => a.projectId?._id || a.projectId)));
      setBookmarks(new Set(bookmarksRes.data.map((b) => b._id)));
      setOwnedIds(
        new Set(
          myProjectsRes.data
            .filter((p) => (p.createdBy?._id || p.createdBy)?.toString() === user?._id?.toString())
            .map((p) => p._id)
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters, debouncedSearch, user?._id]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handleApply = async () => {
    if (!applyModal) return;
    setApplying(applyModal);
    try {
      await api.post(`/applications/${applyModal}`, { message: applyMessage });
      setAppliedIds((prev) => new Set([...prev, applyModal]));
      setApplyModal(null);
      setApplyMessage('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(null);
    }
  };

  const handleBookmark = async (projectId) => {
    try {
      const { data } = await api.post(`/users/bookmarks/${projectId}`);
      setBookmarks(new Set(data.bookmarks));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Feed</h1>
        <p className="mt-1 text-muted">
          Discover projects matched to your skills, {user?.name?.split(' ')[0]}
        </p>
      </div>

      <div className="mb-4 flex gap-1 rounded-lg bg-chrome p-1">
        {FEED_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-surface text-ink shadow-card'
                : 'text-muted hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
            placeholder="Search projects, skills, technologies..."
          />
        </div>
      </div>

      <div className="mb-6 card !p-4">
        <FeedFilters filters={filters} onChange={setFilters} />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : projects.length === 0 ? (
        <div className="card py-16 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-muted" />
          <h3 className="mt-4 text-lg font-semibold">No projects found</h3>
          <p className="mt-1 text-sm text-muted">
            Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onApply={(id) => setApplyModal(id)}
              applying={applying === project._id}
              applied={appliedIds.has(project._id)}
              isOwner={ownedIds.has(project._id)}
              showBookmark
              bookmarked={bookmarks.has(project._id)}
              onBookmark={handleBookmark}
              recommendationReason={project.recommendationReason}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={!!applyModal}
        onClose={() => {
          setApplyModal(null);
          setApplyMessage('');
        }}
        title="Apply to Project"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
              Message (optional)
            </label>
            <textarea
              id="message"
              value={applyMessage}
              onChange={(e) => setApplyMessage(e.target.value)}
              className="input-field min-h-[100px] resize-none"
              placeholder="Tell the project owner why you'd be a great fit..."
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setApplyModal(null)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="button" onClick={handleApply} disabled={applying} className="btn-accent flex-1">
              {applying ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Feed;
