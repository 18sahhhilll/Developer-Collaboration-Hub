import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { validatePassword, validateUsername } from '../utils/validators.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// Generate a random hex token
const makeToken = () => crypto.randomBytes(32).toString('hex');

// ─── Register ─────────────────────────────────────────────────────────────────

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    if (!name || !email || !password || !username) {
      return res.status(400).json({ message: 'Please provide name, email, password, and username' });
    }

    // Validate password strength
    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      return res.status(400).json({ message: pwCheck.message });
    }

    // Validate username
    const unCheck = validateUsername(username);
    if (!unCheck.valid) {
      return res.status(400).json({ message: unCheck.message });
    }

    // Check email taken
    const existingEmail = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (existingEmail) {
      if (!existingEmail.password) {
        return res.status(400).json({
          message: 'An account with this email uses social sign-in. Please continue with Google or GitHub.',
        });
      }
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    // Check username taken
    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(400).json({ message: 'This username is already taken' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = makeToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password: hashedPassword,
      authProvider: 'local',
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // Send verification email (async, don't block registration)
    sendVerificationEmail(user.email, verificationToken).catch((err) =>
      console.error('Failed to send verification email:', err.message)
    );

    res.status(201).json({
      ...issueAuthResponse(user),
      message: 'Account created! Please verify your email before logging in.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────

export const loginUser = async (req, res) => {
  try {
    const { email, password, identifier } = req.body;
    // Support both { email, password } (legacy) and { identifier, password }
    const loginId = (identifier || email || '').trim();

    if (!loginId || !password) {
      return res.status(400).json({ message: 'Please provide your email/username and password' });
    }

    // Find by email OR username
    const isEmail = loginId.includes('@');
    const user = await User.findOne(
      isEmail ? { email: loginId.toLowerCase() } : { username: loginId.toLowerCase() }
    ).select('+password +emailVerificationToken +emailVerificationExpires');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.password) {
      return res.status(401).json({
        message: `This account uses ${user.authProvider === 'google' ? 'Google' : 'GitHub'} sign-in. Please use that method.`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Block login if email not verified (local accounts only)
    if (!user.emailVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in. Check your inbox for a verification link.',
        emailNotVerified: true,
        email: user.email,
      });
    }

    res.json(issueAuthResponse(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get Me ───────────────────────────────────────────────────────────────────

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Verify Email ─────────────────────────────────────────────────────────────

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      return res.status(400).json({ message: 'Verification link is invalid or has expired' });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Resend Verification Email ────────────────────────────────────────────────

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+emailVerificationToken +emailVerificationExpires'
    );

    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: 'If that email is registered, a verification link has been sent.' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'This email is already verified' });
    }

    if (user.authProvider !== 'local') {
      return res.status(400).json({ message: 'Social login accounts do not need email verification' });
    }

    const token = makeToken();
    user.emailVerificationToken = token;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user.email, token);
    res.json({ message: 'Verification email sent. Please check your inbox.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Forgot Password ──────────────────────────────────────────────────────────

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return 200 to prevent email enumeration
    if (!user || user.authProvider !== 'local') {
      return res.json({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    const token = makeToken();
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await user.save();

    await sendPasswordResetEmail(user.email, token);
    res.json({ message: 'Password reset link sent. Check your email (expires in 15 minutes).' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) return res.status(400).json({ message: 'New password is required' });

    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      return res.status(400).json({ message: pwCheck.message });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({ message: 'Password reset link is invalid or has expired' });
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.emailVerified = true; // ensure verified after reset
    await user.save();

    res.json({ message: 'Password reset successfully! You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  registerUser,
  loginUser,
  getMe,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
};
