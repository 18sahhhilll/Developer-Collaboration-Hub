import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import SkillAutocomplete from '../components/SkillAutocomplete';

const Onboarding = () => {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState([]);
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (skip = false) => {
    setLoading(true);
    try {
      const { data } = await api.put('/users/onboarding', {
        skip,
        bio,
        skills,
        socialLinks: { github, linkedin, portfolio },
        githubUsername: github.replace(/https?:\/\/(www\.)?github\.com\//i, '').replace(/\/$/, ''),
      });
      updateUser(data);
      navigate('/feed');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-ink">
            <Code2 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Complete your profile</h1>
          <p className="mt-2 text-muted">
            Complete your profile to improve project recommendations and help collaborators find you.
          </p>
        </div>

        <div className="card mb-6">
          <div className="mb-6 flex items-start gap-3 rounded-lg bg-chrome p-4">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <ul className="space-y-1 text-sm text-muted">
              <li>Better personalized recommendations</li>
              <li>Improved visibility to project owners</li>
              <li>Showcase your skills and experience</li>
              <li>Connect GitHub and LinkedIn profiles</li>
            </ul>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="bio" className="mb-1.5 block text-sm font-medium">Bio</label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="input-field min-h-[80px] resize-none"
                placeholder="Tell collaborators about yourself..."
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Skills</label>
              <SkillAutocomplete value={skills} onChange={setSkills} />
            </div>
            <div>
              <label htmlFor="github" className="mb-1.5 block text-sm font-medium">GitHub URL</label>
              <input id="github" value={github} onChange={(e) => setGithub(e.target.value)} className="input-field" placeholder="https://github.com/username" />
            </div>
            <div>
              <label htmlFor="linkedin" className="mb-1.5 block text-sm font-medium">LinkedIn URL</label>
              <input id="linkedin" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="input-field" placeholder="https://linkedin.com/in/username" />
            </div>
            <div>
              <label htmlFor="portfolio" className="mb-1.5 block text-sm font-medium">Portfolio URL</label>
              <input id="portfolio" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} className="input-field" placeholder="https://yourportfolio.com" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => submit(true)} disabled={loading} className="btn-secondary flex-1">
            Skip For Now
          </button>
          <button type="button" onClick={() => submit(false)} disabled={loading} className="btn-primary flex-1">
            {loading ? 'Saving...' : 'Complete Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
