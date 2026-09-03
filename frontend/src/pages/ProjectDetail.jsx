import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Users, Edit, Trash2, MessageSquare, ArrowLeft, UserMinus, Crown, Shield } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import SkillTags from '../components/SkillTags';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyModal, setApplyModal] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [transferModal, setTransferModal] = useState(false);
  const [transferTarget, setTransferTarget] = useState('');

  const isOwner = project?.createdBy?._id === user?._id || project?.createdBy === user?._id;
  const isMember = project?.members?.some((m) => (m._id || m) === user?._id);
  const isRecruiting = project?.status === 'recruiting' || project?.status === 'open';

  const refreshProject = async () => {
    const { data } = await api.get(`/projects/${id}`);
    setProject(data);
    if (data.createdBy?._id === user?._id || data.createdBy === user?._id) {
      const apps = await api.get(`/applications/project/${id}`);
      setApplications(apps.data);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectRes, myAppsRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get('/applications/my'),
        ]);
        setProject(projectRes.data);
        setApplied(myAppsRes.data.some((a) => (a.projectId?._id || a.projectId) === id));

        const ownerId = projectRes.data.createdBy?._id || projectRes.data.createdBy;
        if (ownerId === user?._id) {
          const { data } = await api.get(`/applications/project/${id}`);
          setApplications(data);
        }
      } catch {
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate, user?._id]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await api.post(`/applications/${id}`, { message: applyMessage });
      setApplied(true);
      setApplyModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleStatusUpdate = async (appId, status) => {
    try {
      await api.put(`/applications/${appId}/status`, { status });
      await refreshProject();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Remove this member from the project?')) return;
    try {
      await api.delete(`/projects/${id}/members/${memberId}`);
      await refreshProject();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handlePromote = async (memberId) => {
    try {
      await api.put(`/projects/${id}/members/${memberId}/promote`);
      await refreshProject();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to promote member');
    }
  };

  const handleTransfer = async () => {
    if (!transferTarget) return;
    try {
      await api.put(`/projects/${id}/transfer-ownership`, { newOwnerId: transferTarget });
      setTransferModal(false);
      await refreshProject();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to transfer ownership');
    }
  };

  const getMemberRole = (memberId) => {
    const idStr = (memberId._id || memberId).toString();
    if (idStr === (project.createdBy?._id || project.createdBy)?.toString()) return 'owner';
    const role = project.memberRoles?.find((r) => r.user?.toString() === idStr || r.user?._id?.toString() === idStr);
    return role?.role || 'member';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!project) return null;

  const skills = project.requiredSkills?.length ? project.requiredSkills : project.technologies;

  return (
    <div className="page-container">
      <Link to="/projects" className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{project.title}</h1>
                  <StatusBadge status={project.status} />
                </div>
                <p className="text-sm text-muted">
                  Created by {project.createdBy?.name} · {project.category}
                </p>
              </div>
              {!isOwner && project.matchPercentage !== undefined && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                  {project.matchPercentage}% skill match
                </span>
              )}
            </div>
            <p className="leading-relaxed text-muted">{project.description}</p>
            {skills?.length > 0 && (
              <div className="mt-6">
                <p className="mb-2 text-sm font-medium">Required Skills</p>
                <SkillTags skills={skills} size="md" />
              </div>
            )}
          </div>

          {isOwner && applications.length > 0 && (
            <div className="card">
              <h2 className="mb-4 text-lg font-semibold">Applications</h2>
              <div className="space-y-3">
                {applications.map((app) => (
                  <div key={app._id} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <Link to={`/profile/${app.userId?._id}`} className="font-medium hover:text-accent">
                        {app.userId?.name}
                      </Link>
                      <p className="text-xs text-muted">{app.userId?.role}</p>
                      {app.message && <p className="mt-1 text-sm text-muted">{app.message}</p>}
                    </div>
                    {app.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleStatusUpdate(app._id, 'accepted')} className="btn-accent !py-1.5 !text-xs">Accept</button>
                        <button type="button" onClick={() => handleStatusUpdate(app._id, 'rejected')} className="btn-secondary !py-1.5 !text-xs">Reject</button>
                      </div>
                    ) : (
                      <StatusBadge status={app.status} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-muted" />
              <h2 className="font-semibold">Team ({project.members?.length}/{project.teamSize})</h2>
            </div>
            <div className="space-y-3">
              {project.members?.map((member) => {
                const memberId = member._id || member;
                const role = getMemberRole(memberId);
                return (
                  <div key={memberId} className="flex items-center justify-between rounded-lg p-2 hover:bg-chrome">
                    <Link to={`/profile/${memberId}`} className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-chrome text-sm font-semibold">
                        {member.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs capitalize text-muted">{role === 'co-leader' ? 'Co-Leader' : role}</p>
                      </div>
                    </Link>
                    {isOwner && role !== 'owner' && (
                      <div className="flex gap-1">
                        {role !== 'co-leader' && (
                          <button type="button" onClick={() => handlePromote(memberId)} className="rounded p-1.5 text-muted hover:bg-surface hover:text-accent" title="Promote to co-leader">
                            <Shield className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button type="button" onClick={() => handleRemoveMember(memberId)} className="rounded p-1.5 text-muted hover:bg-surface hover:text-red-600" title="Remove member">
                          <UserMinus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card space-y-3">
            {isOwner ? (
              <>
                <Link to={`/projects/${id}/edit`} className="btn-primary w-full">
                  <Edit className="h-4 w-4" />
                  Manage Project
                </Link>
                {isMember && (
                  <Link to={`/chat/${id}`} className="btn-secondary w-full">
                    <MessageSquare className="h-4 w-4" />
                    Open Chat
                  </Link>
                )}
                <button type="button" onClick={() => setTransferModal(true)} className="btn-secondary w-full">
                  <Crown className="h-4 w-4" />
                  Transfer Ownership
                </button>
                <button type="button" onClick={handleDelete} className="btn-secondary w-full !text-red-600">
                  <Trash2 className="h-4 w-4" />
                  Delete Project
                </button>
              </>
            ) : (
              <>
                {!isMember && !applied && isRecruiting && (
                  <button type="button" onClick={() => setApplyModal(true)} className="btn-accent w-full">
                    Apply to Join
                  </button>
                )}
                {applied && !isMember && (
                  <p className="text-center text-sm text-muted">Application submitted</p>
                )}
                {isMember && (
                  <Link to={`/chat/${id}`} className="btn-primary w-full">
                    <MessageSquare className="h-4 w-4" />
                    Open Chat
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={applyModal} onClose={() => setApplyModal(false)} title="Apply to Project">
        <div className="space-y-4">
          <textarea value={applyMessage} onChange={(e) => setApplyMessage(e.target.value)} className="input-field min-h-[100px] resize-none" placeholder="Why do you want to join?" />
          <button type="button" onClick={handleApply} disabled={applying} className="btn-accent w-full">
            {applying ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={transferModal} onClose={() => setTransferModal(false)} title="Transfer Ownership">
        <div className="space-y-4">
          <p className="text-sm text-muted">Select a team member to become the new project owner.</p>
          <select value={transferTarget} onChange={(e) => setTransferTarget(e.target.value)} className="input-field">
            <option value="">Select member...</option>
            {project.members
              ?.filter((m) => (m._id || m) !== (project.createdBy?._id || project.createdBy))
              .map((m) => (
                <option key={m._id || m} value={m._id || m}>{m.name}</option>
              ))}
          </select>
          <button type="button" onClick={handleTransfer} disabled={!transferTarget} className="btn-primary w-full">
            Transfer Ownership
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
