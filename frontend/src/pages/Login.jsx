import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Code2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';
import GitHubAuthButton from '../components/GitHubAuthButton';
import AuthDivider from '../components/AuthDivider';

const Login = () => {
  const [identifier, setIdentifier] = useState(''); // email or username
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine animation direction: coming from /register = slide from left
  const fromRegister = location.state?.from === '/register';
  const animClass = fromRegister ? 'auth-enter-from-left' : 'auth-enter-from-right';

  const redirectAfterAuth = (userData) => {
    navigate(userData.onboardingCompleted ? '/feed' : '/onboarding');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEmailNotVerified(false);
    setLoading(true);
    try {
      const userData = await login(identifier.trim(), password);
      redirectAfterAuth(userData);
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      if (err.response?.data?.emailNotVerified) {
        setEmailNotVerified(true);
        setUnverifiedEmail(err.response.data.email || '');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    setError('');
    setGoogleLoading(true);
    try {
      const userData = await googleLogin(response.credential);
      redirectAfterAuth(userData);
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    setResendLoading(true);
    setResendMsg('');
    try {
      const api = (await import('../services/api')).default;
      await api.post('/auth/resend-verification', { email: unverifiedEmail });
      setResendMsg('Verification email sent! Please check your inbox.');
    } catch {
      setResendMsg('Failed to resend. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden w-1/2 flex-col justify-between bg-ink p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <Code2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-white">DevCollab</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight text-white">
            Connect. Collaborate.
            <br />
            Build together.
          </h1>
          <p className="mt-4 max-w-md text-zinc-400">
            Discover projects, find teammates, and ship products with developers who share your skills and passion.
          </p>
        </div>
        <p className="text-sm text-zinc-500">Developer Collaboration Hub</p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div key="login" className={`w-full max-w-[400px] ${animClass}`}>
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink">
                <Code2 className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold">DevCollab</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold">Welcome back</h2>
          <p className="mt-1 text-sm text-muted">Sign in to your account</p>

          {/* Error */}
          {error && !emailNotVerified && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Email not verified state */}
          {emailNotVerified && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <p className="font-medium">Email not verified</p>
              <p className="mt-1">{error}</p>
              {resendMsg ? (
                <p className="mt-2 text-green-700">{resendMsg}</p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="mt-2 font-medium underline hover:no-underline"
                >
                  {resendLoading ? 'Sending...' : 'Resend verification email'}
                </button>
              )}
            </div>
          )}

          {/* Social auth buttons */}
          <div className="mt-8 space-y-3">
            <GoogleAuthButton
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google sign-in was cancelled or failed')}
              text="continue_with"
            />
            {googleLoading && (
              <p className="text-center text-sm text-muted">Signing in with Google...</p>
            )}
            <GitHubAuthButton text="continue_with" disabled={loading || googleLoading} />
          </div>

          <AuthDivider />

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="identifier" className="mb-1.5 block text-sm font-medium">
                Email or Username
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="input-field"
                placeholder="you@example.com or username"
                required
                autoComplete="username"
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-accent hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="••••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading || googleLoading} className="btn-primary w-full">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Don&apos;t have an account?{' '}
            <Link to="/register" state={{ from: '/login' }} className="font-medium text-accent hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
