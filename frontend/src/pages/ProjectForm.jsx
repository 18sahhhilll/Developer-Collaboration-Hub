import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import SkillAutocomplete from '../components/SkillAutocomplete';
import { PROJECT_STATUSES } from '../data/constants';

const categories = ['General', 'Web', 'Mobile', 'AI/ML', 'DevOps', 'Open Source', 'Blockchain'];

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: '',
    description: '',
    skills: [],
    teamSize: 5,
    category: 'General',
    status: 'recruiting',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      api.get(`/projects/${id}`).then(({ data }) => {
        const status = data.status === 'open' ? 'recruiting' : data.status === 'closed' ? 'archived' : data.status;
        setForm({
          title: data.title,
          description: data.description,
          skills: data.requiredSkills || data.technologies || [],
          teamSize: data.teamSize,
          category: data.category || 'General',
          status,
        });
      });
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      title: form.title,
      description: form.description,
      requiredSkills: form.skills,
      technologies: form.skills,
      teamSize: Number(form.teamSize),
      category: form.category,
      status: form.status,
    };

    try {
      if (isEdit) {
        await api.put(`/projects/${id}`, payload);
        navigate(`/projects/${id}`);
      } else {
        const { data } = await api.post('/projects', payload);
        navigate(`/projects/${data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold">{isEdit ? 'Edit Project' : 'Create Project'}</h1>
      <p className="mb-8 text-muted">
        {isEdit ? 'Update your project details' : 'Share your idea and find collaborators'}
      </p>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium">Project Title</label>
          <input id="title" name="title" value={form.title} onChange={handleChange} className="input-field" required />
        </div>

        <div>
          <label htmlFor="description" className="mb-1.5 block text-sm font-medium">Description</label>
          <textarea id="description" name="description" value={form.description} onChange={handleChange} className="input-field min-h-[120px] resize-none" required />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Required Skills</label>
          <SkillAutocomplete value={form.skills} onChange={(skills) => setForm((p) => ({ ...p, skills }))} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="teamSize" className="mb-1.5 block text-sm font-medium">Team Size</label>
            <input id="teamSize" name="teamSize" type="number" min={1} max={50} value={form.teamSize} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label htmlFor="category" className="mb-1.5 block text-sm font-medium">Category</label>
            <select id="category" name="category" value={form.category} onChange={handleChange} className="input-field">
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {isEdit && (
          <div>
            <label htmlFor="status" className="mb-1.5 block text-sm font-medium">Status</label>
            <select id="status" name="status" value={form.status} onChange={handleChange} className="input-field">
              {PROJECT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Saving...' : isEdit ? 'Update Project' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
