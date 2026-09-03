import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Github,
  Linkedin,
  ExternalLink,
  Star,
  GitFork,
  Save,
  Pencil,
  FolderKanban,
  Send,
  CheckCircle,
  Users,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import SkillTags from '../components/SkillTags';
import SkillAutocomplete from '../components/SkillAutocomplete';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const PROJECT_TABS = [
  { id: 'all', label: 'All' },
  { id: 'created', label: 'Created' },
  { id: 'contributed', label: 'Contributed' },
  { id: 'completed', label: 'Completed' },
];

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="rounded-lg border border-border bg-chrome/50 p-4 text-center">
    <Icon className="mx-auto h-5 w-5 text-muted" />
    <p className="mt-2 text-2xl font-bold">{value}</p>
    <p className="text-xs text-muted">{label}</p>
  </div>
);

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const isOwnProfile = !id || id === currentUser?._id;
  const profileId = isOwnProfile ? currentUser?._id : id;

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectTab, setProjectTab] = useState('all');
  const [githubData, setGithubData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ skills: [] });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const endpoint = isOwnProfile ? '/users/profile' : `/users/profile/${profileId}`;
        const statsEndpoint = isOwnProfile ? '/users/profile/stats' : `/users/profile/${profileId}/stats`;

        const [profileRes, statsRes] = await Promise.all([
          api.get(endpoint),
          api.get(statsEndpoint),
        ]);

        setProfile(profileRes.data);
        setStats(statsRes.data);
        setForm({
          name: profileRes.data.name || '',
          bio: profileRes.data.bio || '',
          skills: profileRes.data.skills || [],
          role: profileRes.data.role || '',
          experience: profileRes.data.experience || '',
          availability: profileRes.data.availability || 'Available',
          interests: profileRes.data.interests?.join(', ') || '',
          githubUsername: profileRes.data.githubUsername || '',
          showCompletedProjects: profileRes.data.showCompletedProjects !== false,
          socialLinks: {
            github: profileRes.data.socialLinks?.github || '',
            linkedin: profileRes.data.socialLinks?.linkedin || '',
            leetcode: profileRes.data.socialLinks?.leetcode || '',
            portfolio: profileRes.data.socialLinks?.portfolio || '',
          },
        });

        try {
          const ghEndpoint = isOwnProfile ? '/github' : `/github/${profileId}`;
          const ghRes = await api.get(ghEndpoint);
          setGithubData(ghRes.data);
        } catch {
          setGithubData(null);
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };

    if (profileId) fetchProfile();
  }, [profileId, isOwnProfile]);

  useEffect(() => {
    if (!profileId) return;
    const endpoint = isOwnProfile
      ? '/users/profile/projects'
      : `/users/profile/${profileId}/projects`;
    api.get(endpoint, { params: { filter: projectTab } }).then(({ data }) => setProjects(data));
  }, [profileId, projectTab, isOwnProfile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('social.')) {
      const key = name.split('.')[1];
      setForm((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, [key]: value } }));
    } else if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        bio: form.bio,
        skills: form.skills,
        role: form.role,
        experience: form.experience,
        availability: form.availability,
        interests: form.interests.split(',').map((s) => s.trim()).filter(Boolean),
        githubUsername: form.githubUsername,
        socialLinks: form.socialLinks,
        showCompletedProjects: form.showCompletedProjects,
      };
      const { data } = await api.put('/users/profile', payload);
      setProfile(data);
      updateUser(data);
      setEditing(false);
      try {
        const ghRes = await api.get('/github');
        setGithubData(ghRes.data);
      } catch {
        setGithubData(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return <div className="page-container text-center"><p className="text-muted">Profile not found</p></div>;
  }

  const socialLinks = profile.socialLinks || {};

  return (
    <div className="page-container">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* ABOUT */}
          <div className="card">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-chrome text-2xl font-bold">
                  {profile.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{profile.name}</h1>
                  <p className="text-muted">{profile.role || 'Developer'}</p>
                  {profile.availability && (
                    <span className="mt-1 inline-block rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                      {profile.availability}
                    </span>
                  )}
                </div>
              </div>
              {isOwnProfile && !editing && (
                <button type="button" onClick={() => setEditing(true)} className="btn-secondary !py-2">
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Name</label>
                  <input name="name" value={form.name} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Bio</label>
                  <textarea name="bio" value={form.bio} onChange={handleChange} className="input-field min-h-[80px]" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Skills</label>
                  <SkillAutocomplete value={form.skills} onChange={(skills) => setForm((p) => ({ ...p, skills }))} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Role</label>
                    <input name="role" value={form.role} onChange={handleChange} className="input-field" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Experience</label>
                    <input name="experience" value={form.experience} onChange={handleChange} className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Availability</label>
                  <select name="availability" value={form.availability} onChange={handleChange} className="input-field">
                    <option value="Available">Available</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Busy">Busy</option>
                    <option value="Not available">Not available</option>
                  </select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">GitHub URL</label>
                    <input name="social.github" value={form.socialLinks.github} onChange={handleChange} className="input-field" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">LinkedIn URL</label>
                    <input name="social.linkedin" value={form.socialLinks.linkedin} onChange={handleChange} className="input-field" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Portfolio URL</label>
                    <input name="social.portfolio" value={form.socialLinks.portfolio} onChange={handleChange} className="input-field" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">GitHub Username</label>
                    <input name="githubUsername" value={form.githubUsername} onChange={handleChange} className="input-field" />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="showCompletedProjects" checked={form.showCompletedProjects} onChange={handleChange} className="rounded" />
                  Show completed projects on public profile
                </label>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setEditing(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="button" onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {profile.bio && <p className="mt-4 leading-relaxed text-muted">{profile.bio}</p>}
                {profile.experience && <p className="mt-2 text-sm"><span className="font-medium">Experience:</span> {profile.experience}</p>}
                {profile.skills?.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium">Skills</p>
                    <SkillTags skills={profile.skills} size="md" />
                  </div>
                )}
              </>
            )}
          </div>

          {/* STATISTICS */}
          {stats && (
            <div className="card">
              <h2 className="mb-4 text-lg font-semibold">Statistics</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <StatCard icon={FolderKanban} label="Projects Created" value={stats.projectsCreated} />
                <StatCard icon={Users} label="Contributed" value={stats.projectsContributed} />
                <StatCard icon={FolderKanban} label="Active Projects" value={stats.activeProjects} />
                <StatCard icon={CheckCircle} label="Completed" value={stats.completedProjects} />
                <StatCard icon={Send} label="Applications Sent" value={stats.applicationsSent} />
                <StatCard icon={CheckCircle} label="Accepted" value={stats.applicationsAccepted} />
              </div>
            </div>
          )}

          {/* PROJECTS */}
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold">Projects</h2>
            <div className="mb-4 flex gap-1">
              {PROJECT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setProjectTab(tab.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                    projectTab === tab.id ? 'bg-ink text-white' : 'bg-chrome text-muted'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {projects.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">No projects in this category</p>
            ) : (
              <div className="space-y-3">
                {projects.map((p) => (
                  <Link key={p._id} to={`/projects/${p._id}`} className="flex items-center justify-between rounded-lg border border-border p-3 transition hover:bg-chrome">
                    <div>
                      <p className="font-medium">{p.title}</p>
                      <p className="text-xs capitalize text-muted">{p.role}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* GitHub */}
          {githubData && (
            <div className="card">
              <div className="mb-4 flex items-center gap-3">
                {githubData.profile?.avatar && (
                  <img src={githubData.profile.avatar} alt="" className="h-10 w-10 rounded-full" />
                )}
                <div>
                  <h2 className="font-semibold">GitHub</h2>
                  <a href={githubData.profile?.url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline">
                    @{githubData.profile?.username}
                  </a>
                </div>
              </div>
              {githubData.repos?.length > 0 && (
                <div className="space-y-3">
                  {githubData.repos.slice(0, 4).map((repo) => (
                    <a key={repo.id} href={repo.url} target="_blank" rel="noopener noreferrer" className="block rounded-lg border border-border p-3 transition hover:bg-chrome">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-accent">{repo.name}</span>
                        <ExternalLink className="h-3.5 w-3.5 text-muted" />
                      </div>
                      <div className="mt-1 flex gap-3 text-xs text-muted">
                        {repo.language && <span>{repo.language}</span>}
                        <span className="flex items-center gap-1"><Star className="h-3 w-3" />{repo.stars}</span>
                        <span className="flex items-center gap-1"><GitFork className="h-3 w-3" />{repo.forks}</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="card">
            <h2 className="mb-4 font-semibold">Social Links</h2>
            <div className="space-y-3">
              {socialLinks.github && (
                <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted hover:text-ink">
                  <Github className="h-4 w-4" /> GitHub
                </a>
              )}
              {socialLinks.linkedin && (
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted hover:text-ink">
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </a>
              )}
              {socialLinks.portfolio && (
                <a href={socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted hover:text-ink">
                  <ExternalLink className="h-4 w-4" /> Portfolio
                </a>
              )}
              {!socialLinks.github && !socialLinks.linkedin && !socialLinks.portfolio && (
                <p className="text-sm text-muted">No social links added</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Profile;
