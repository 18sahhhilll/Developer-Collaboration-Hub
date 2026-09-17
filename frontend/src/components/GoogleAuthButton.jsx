import { GoogleLogin } from '@react-oauth/google';

/**
 * Google Auth Button — Uses the official GoogleLogin component from @react-oauth/google.
 * Uses Google's official GIS iframe button which is natively trusted by browsers
 * and NEVER blocked by popup blockers.
 */
const GoogleAuthButton = ({ onSuccess, onError, text = 'continue_with' }) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return (
      <p className="rounded-lg border border-border bg-chrome px-4 py-3 text-center text-xs text-muted">
        Google sign-in is not configured. Set VITE_GOOGLE_CLIENT_ID in your environment.
      </p>
    );
  }

  return (
    <div className="flex justify-center w-full">
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          if (credentialResponse?.credential) {
            onSuccess?.({ credential: credentialResponse.credential });
          } else {
            onError?.();
          }
        }}
        onError={() => {
          onError?.();
        }}
        text={text}
        shape="rectangular"
        theme="outline"
        size="large"
        width="380"
      />
    </div>
  );
};

export default GoogleAuthButton;