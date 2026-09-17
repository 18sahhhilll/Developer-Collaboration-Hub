import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * GitHub OAuth callback page.
 *
 * GitHub redirects here with ?code=xxx after the user authorizes.
 * This page extracts the code, sends it to the backend to exchange
 * for a token, then redirects to /feed or /onboarding.
 */
const GitHubCallback = () => {
  const [searchParams] = useSearchParams();
  const { githubLogin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');

    if (!code) {
      setError('No authorization code received from GitHub.');
      return;
    }

    const handleCallback = async () => {
      try {
        const userData = await githubLogin(code);
        navigate(userData.onboardingCompleted ? '/feed' : '/onboarding', { replace: true });
      } catch (err) {
        setError(err.response?.data?.message || 'GitHub authentication failed. Please try again.');
      }
    };

    handleCallback();
  }, [searchParams, githubLogin, navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold">Authentication Failed</h2>
          <p className="mt-3 text-muted">{error}</p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="btn-primary mt-6"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-muted">Signing in with GitHub...</p>
      </div>
    </div>
  );
};

export default GitHubCallback;
