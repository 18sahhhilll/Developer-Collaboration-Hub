/**
 * GitHub OAuth service.
 * Exchanges authorization code for access token, then fetches GitHub user profile.
 * Uses the GitHub OAuth App (not GitHub Apps).
 */
import axios from 'axios';

/**
 * Exchange authorization code for GitHub access token.
 */
export const exchangeCodeForToken = async (code) => {
  const response = await axios.post(
    'https://github.com/login/oauth/access_token',
    {
      client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
      client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
      code,
    },
    {
      headers: { Accept: 'application/json' },
    }
  );

  if (response.data.error) {
    throw new Error(response.data.error_description || 'GitHub OAuth failed');
  }

  return response.data.access_token;
};

/**
 * Fetch GitHub user profile using access token.
 * Also fetches primary email if not public.
 */
export const fetchGithubProfile = async (accessToken) => {
  const headers = { Authorization: `Bearer ${accessToken}` };

  const [userRes, emailsRes] = await Promise.all([
    axios.get('https://api.github.com/user', { headers }),
    axios.get('https://api.github.com/user/emails', { headers }),
  ]);

  const githubUser = userRes.data;
  const emails = emailsRes.data;

  // Get primary verified email
  const primaryEmail = emails.find((e) => e.primary && e.verified)?.email
    || emails.find((e) => e.verified)?.email
    || githubUser.email;

  return {
    githubId: String(githubUser.id),
    githubUsername: githubUser.login,
    email: primaryEmail?.toLowerCase(),
    name: githubUser.name || githubUser.login,
    avatarUrl: githubUser.avatar_url,
    bio: githubUser.bio || '',
    publicRepos: githubUser.public_repos || 0,
    followers: githubUser.followers || 0,
    following: githubUser.following || 0,
  };
};

export default { exchangeCodeForToken, fetchGithubProfile };
