import { useGoogleLogin } from '@react-oauth/google';

/**
 * Custom Google auth button — uses the popup flow via useGoogleLogin.
 *
 * This is the most reliable approach:
 *   - No hidden iframes or click proxies — the button is a real, always-clickable element
 *   - useGoogleLogin opens a Google popup → returns an access_token
 *   - The backend accepts either { credential } (ID token) or { access_token }
 *   - Styled identically to the GitHub button for visual consistency
 */
const GoogleAuthButton = ({ onSuccess, onError, text = 'continue_with', disabled = false }) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      // Pass access_token to parent — the parent's handler sends it to the backend
      onSuccess?.({ access_token: tokenResponse.access_token });
    },
    onError: () => {
      onError?.();
    },
  });

  if (!clientId) {
    return (
      <p className="rounded-lg border border-border bg-chrome px-4 py-3 text-center text-xs text-muted">
        Google sign-in is not configured. Set VITE_GOOGLE_CLIENT_ID in your environment.
      </p>
    );
  }

  const label =
    text === 'signup_with' ? 'Sign up with Google' : 'Continue with Google';

  return (
    <button
      type="button"
      onClick={() => googleLogin()}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-ink shadow-sm transition hover:bg-chrome disabled:opacity-50"
    >
      {/* Google "G" SVG icon */}
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      {label}
    </button>
  );
};

export default GoogleAuthButton;