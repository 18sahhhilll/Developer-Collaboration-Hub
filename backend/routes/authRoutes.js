import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { googleAuth } from '../controllers/googleAuthController.js';
import { githubOAuthCallback } from '../controllers/githubAuthController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Core auth
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// Social auth
router.post('/google', googleAuth);
router.post('/github/callback', githubOAuthCallback);

// Email verification
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);

// Password recovery
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
