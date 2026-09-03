import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { verifyGoogleToken } from '../services/googleAuthService.js';

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

export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(503).json({ message: 'Google OAuth is not configured on the server' });
    }

    const payload = await verifyGoogleToken(credential);
    const googleId = payload.sub;
    const email = payload.email?.toLowerCase();
    const name = payload.name || email?.split('@')[0] || 'User';
    const picture = payload.picture || '';

    if (!email) {
      return res.status(400).json({ message: 'Google account did not provide an email address' });
    }

    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    }).select('+password');

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
      }
      user.emailVerified = true;
      if (picture && !user.avatarUrl) {
        user.avatarUrl = picture;
      }
      // Generate username if missing
      if (!user.username) {
        user.username = await generateUniqueUsername(name.split(' ')[0] || email.split('@')[0]);
      }
      await user.save();
    } else {
      const username = await generateUniqueUsername(name.split(' ')[0] || email.split('@')[0]);
      user = await User.create({
        name,
        email,
        username,
        googleId,
        authProvider: 'google',
        emailVerified: true,
        avatarUrl: picture,
        onboardingCompleted: false,
      });
    }

    res.json(issueAuthResponse(user));
  } catch (error) {
    console.error('Google auth error:', error.message);
    res.status(401).json({ message: 'Google authentication failed' });
  }
};

export default { googleAuth };
