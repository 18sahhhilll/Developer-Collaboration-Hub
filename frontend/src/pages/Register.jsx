import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Code2, Eye, EyeOff, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';
import GitHubAuthButton from '../components/GitHubAuthButton';
import AuthDivider from '../components/AuthDivider';
import PasswordStrengthMeter, { isPasswordValid } from '../components/PasswordStrengthMeter';

const USERNAME_REGEX = /^[a-zA-Z0-9_.]+$/;
const RESERVED = ['admin', 'api', 'feed', 'settings', 'login', 'register', 'support', 'help', 'root'];

const validateUsername = (u) => {
  if (!u) return null;
  if (u.length < 3) return 'Too short (min 3 chars)';
  if (u.length > 20) return 'Too long (max 20 chars)';
  if (!USERNAME_REGEX.test(u)) return 'Letters, numbers, _ and . only';
  if (RESERVED.includes(u.toLowerCase())) return 'This username is reserved';
  return null; // valid
};

const Register = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine animation direction: coming from /login = slide from right
  const fromLogin = location.state?.from === '/login';
  const animClass = fromLogin ? 'auth-enter-from-right' : 'auth-enter-from-left';

  const usernameError = validateUsername(username);
  const usernameValid = username.length >= 3 && !usernameError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend validation
    if (!isPasswordValid(password)) {
      setError('Please create a stronger password that meets all requirements below');
      return;
    }
    if (usernameError) {
      setError(usernameError);
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, username);
      // Show "verify email" message instead of redirecting
      setRegisteredEmail(email);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    setError('');
    setGoogleLoading(true);
    try {
      const userData = await googleLogin(response.credential);
      navigate(userData.onboardingCompleted ? '/feed' : '/onboarding');
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-up failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Success state — show verify email message
  if (registeredEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold">Check your email</h2>
          <p className="mt-3 text-muted">
            We sent a verification link to <strong>{registeredEmail}</strong>. Click the link to activate your account.
          </p>
          <p className="mt-2 text-sm text-muted">
            (In development mode, check the server terminal console for the link.)
          </p>
          <Link to="/login" className="mt-6 inline-block btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

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
            Join the community
            <br />
            of builders.
          </h1>
          <p className="mt-4 max-w-md text-zinc-400">
            Create your profile, showcase your skills, and find your next collaboration opportunity.
          </p>
        </div>
        <p className="text-sm text-zinc-500">Developer Collaboration Hub</p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div key="register" className={`w-full max-w-[400px] ${animClass}`}>
          <h2 className="text-2xl font-bold">Create account</h2>
          <p className="mt-1 text-sm text-muted">Start collaborating today</p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Social auth */}
          <div className="mt-8 space-y-3">
            <GoogleAuthButton
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google sign-up was cancelled or failed')}
              text="signup_with"
            />
            {googleLoading && (
              <p className="mt-2 text-center text-sm text-muted">Creating account with Google...</p>
            )}
            <GitHubAuthButton text="signup_with" disabled={loading || googleLoading} />
          </div>

          <AuthDivider />

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Jane Developer"
                required
              />
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="mb-1.5 block text-sm font-medium">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">@</span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  className="input-field pl-7 pr-8"
                  placeholder="janedeveloper"
                  required
                  minLength={3}
                  maxLength={20}
                  autoComplete="username"
                />
                {username.length >= 3 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameValid ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-400" />
                    )}
                  </span>
                )}
              </div>
              {username.length >= 3 && usernameError && (
                <p className="mt-1 text-xs text-red-500">{usernameError}</p>
              )}
              {usernameValid && (
                <p className="mt-1 text-xs text-green-600">@{username} looks good!</p>
              )}
              <p className="mt-1 text-xs text-muted">3–20 characters: letters, numbers, _ and . only</p>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Create a strong password"
                  required
                  autoComplete="new-password"
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
              <PasswordStrengthMeter password={password} />
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading || (password && !isPasswordValid(password)) || (username && !usernameValid)}
              className="btn-primary w-full"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" state={{ from: '/register' }} className="font-medium text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
