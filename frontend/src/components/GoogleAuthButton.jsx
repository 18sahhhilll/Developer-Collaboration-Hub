import { useCallback, useRef, useEffect } from 'react';

/**
 * Custom Google auth button — renders a fully styled button (matching GitHub)
 * and uses Google Identity Services under the hood to obtain a credential (JWT ID token).
 *
 * Strategy: render Google's native button into a hidden off-screen container,
 * then proxy clicks from our custom button to the real Google button.
 * This preserves the credential/ID-token flow the backend expects.
 */
const GoogleAuthButton = ({ onSuccess, onError, text = 'continue_with' }) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const hiddenRef = useRef(null);
  const initialized = useRef(false);

  // Render Google's real (hidden) button so we can click it programmatically
  useEffect(() => {
    if (!clientId || initialized.current || !hiddenRef.current) return;
    if (!window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (response?.credential) {
          onSuccess?.(response);
        } else {
          onError?.();
        }
      },
    });

    window.google.accounts.id.renderButton(hiddenRef.current, {
      type: 'standard',
      size: 'large',
      width: 300,
    });

    initialized.current = true;
  }, [clientId, onSuccess, onError]);

  const handleClick = useCallback(() => {
    if (!clientId) {
      alert(
        'Google OAuth is not configured. Please add VITE_GOOGLE_CLIENT_ID to your frontend .env file.'
      );
      return;
    }

    // Click the real Google button hidden off-screen
    const realBtn =
      hiddenRef.current?.querySelector('div[role="button"]') ||
      hiddenRef.current?.querySelector('iframe');

    if (realBtn) {
      realBtn.click();
    } else {
      // Fallback: trigger One Tap prompt
      window.google?.accounts?.id?.prompt?.();
    }
  }, [clientId]);

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
    <>
      {/* Hidden real Google button (off-screen, not display:none so it stays interactive) */}
      <div
        ref={hiddenRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          whiteSpace: 'nowrap',
        }}
      />

      {/* Custom styled button — matches GitHub button exactly */}
      <button
        type="button"
        onClick={handleClick}
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
    </>
  );
};

export default GoogleAuthButton;
