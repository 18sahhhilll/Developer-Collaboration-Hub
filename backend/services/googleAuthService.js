import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

let googleClient = null;

const getGoogleClient = () => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID is not configured');
  }
  if (!googleClient) {
    googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }
  return googleClient;
};

/**
 * Verify a Google ID token (credential) — used by the One Tap / renderButton flow.
 * Returns the JWT payload with sub, email, name, picture.
 */
export const verifyGoogleToken = async (idToken) => {
  const client = getGoogleClient();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
};

/**
 * Fetch user info using a Google access_token — used by the popup (useGoogleLogin) flow.
 * Returns the same shape as verifyGoogleToken: { sub, email, name, picture }.
 */
export const fetchGoogleUserInfo = async (accessToken) => {
  const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return {
    sub: data.sub,
    email: data.email,
    name: data.name,
    picture: data.picture,
    email_verified: data.email_verified,
  };
};

export default { verifyGoogleToken, fetchGoogleUserInfo };
