/**
 * GitHub OAuth controller.
 * Handles POST /api/auth/github/callback — receives code, exchanges for token,
 * fetches profile, and creates/links user account.
 */
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { exchangeCodeForToken, fetchGithubProfile } from '../services/githubOAuthService.js';

const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9_.]/g, '_')
    .replace(/__+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 18) || 'user';

const generateUniqueUsername = async (base) => {
  let candidate = slugify(base);
  if (candidate.length < 3) candidate = `dev_${candidate}`;
  const exists = await User.findOne({ username: candidate });
  if (!exists) return candidate;
  for (let i = 1; i <= 99; i++) {
    const suffixed = `${candidate.slice(0, 16)}_${i}`;
    const taken = await User.findOne({ username: suffixed });
    if (!taken) return suffixed;
  }
  return `user_${Date.now()}`;
};

const issueAuthResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  username: user.username,
  token: generateToken(user._id),
  onboardingCompleted: user.onboardingCompleted,
  emailVerified: user.emailVerified,
  authProvider: user.authProvider,
});

export const githubOAuthCallback = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'GitHub authorization code is required' });
    }

    if (!process.env.GITHUB_OAUTH_CLIENT_ID || !process.env.GITHUB_OAUTH_CLIENT_SECRET) {
      return res.status(503).json({ message: 'GitHub OAuth is not configured on the server' });
    }

    // Exchange code for token and fetch GitHub profile
    const accessToken = await exchangeCodeForToken(code);
    const profile = await fetchGithubProfile(accessToken);

    if (!profile.email) {
      return res.status(400).json({
        message:
          'Your GitHub account does not have a public or verified email. Please add one to your GitHub account.',
      });
    }

    // Try to find existing user by githubId or email (link accounts)
    let user = await User.findOne({
      $or: [{ githubId: profile.githubId }, { email: profile.email }],
    });

    if (user) {
      // Link GitHub to existing account if not already linked
      if (!user.githubId) user.githubId = profile.githubId;
      if (!user.githubUsername) user.githubUsername = profile.githubUsername;
      user.emailVerified = true; // GitHub verified = email verified
      if (!user.avatarUrl && profile.avatarUrl) user.avatarUrl = profile.avatarUrl;
      // Update GitHub data cache
      user.githubData = {
        bio: profile.bio,
        publicRepos: profile.publicRepos,
        followers: profile.followers,
        following: profile.following,
        lastSynced: new Date(),
      };
      await user.save();
    } else {
      // Create new account
      const username = await generateUniqueUsername(profile.githubUsername || profile.name);
      user = await User.create({
        name: profile.name,
        email: profile.email,
        username,
        githubId: profile.githubId,
        githubUsername: profile.githubUsername,
        authProvider: 'github',
        emailVerified: true,
        avatarUrl: profile.avatarUrl,
        githubData: {
          bio: profile.bio,
          publicRepos: profile.publicRepos,
          followers: profile.followers,
          following: profile.following,
          lastSynced: new Date(),
        },
        onboardingCompleted: false,
      });
    }

    res.json(issueAuthResponse(user));
  } catch (error) {
    console.error('GitHub OAuth error:', error.message);
    res.status(401).json({ message: 'GitHub authentication failed. Please try again.' });
  }
};

export default { githubOAuthCallback };
