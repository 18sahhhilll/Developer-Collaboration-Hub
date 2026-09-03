import { useRef, useEffect } from 'react';

/**
 * Custom Google auth button — renders a fully styled button (matching GitHub)
 * and uses Google Identity Services under the hood to obtain a credential (JWT ID token).
 *
 * Strategy: render Google's real button INVISIBLY, stretched exactly over our
 * custom-styled button. The user's real click lands directly on Google's iframe,
 * so it's a genuine, trusted click — not a synthetic .click() proxy, which
 * browsers silently block for cross-origin iframes (that was the previous bug).
 */
const GoogleAuthButton = ({ onSuccess, onError, text = 'continue_with' }) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const overlayRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!clientId || initialized.current || !overlayRef.current) return;
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

    window.google.accounts.id.renderButton(overlayRef.current, {
      type: 'standard',
      size: 'large',
      width: 320, // will be stretched to fill the wrapper via CSS below
    });

    initialized.current = true;
  }, [clientId, onSuccess, onError]);

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
    <div className="relative w-full">
      {/* Visible custom-styled button (purely visual, not clickable — pointer-events disabled) */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-ink shadow-sm transition hover:bg-chrome disabled:opacity-50"
      >
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

      {/* Real Google button, invisible, stretched exactly over the visible one.
          The user's click lands on THIS element directly — a genuine trusted
          click on Google's own iframe, so their popup/FedCM flow fires correctly. */}
      <div
        ref={overlayRef}
        className="absolute inset-0 overflow-hidden opacity-0"
        style={{ colorScheme: 'light' }}
      />
    </div>
  );
};

export default GoogleAuthButton;