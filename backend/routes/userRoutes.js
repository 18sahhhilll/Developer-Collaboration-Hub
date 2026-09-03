import express from 'express';
import {
  getProfile,
  getPublicProfile,
  updateProfile,
  toggleBookmark,
  getBookmarks,
  completeOnboarding,
  getProfileStats,
  getProfileProjects,
  updateAvatar,
  getUserBadges,
  refreshBadges,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Own profile
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/avatar', protect, updateAvatar);
router.get('/profile/stats', protect, (req, res) => getProfileStats(req, res));
router.get('/profile/projects', protect, (req, res) => getProfileProjects(req, res));
router.put('/onboarding', protect, completeOnboarding);

// Badges
router.get('/badges', protect, getUserBadges);
router.post('/badges/refresh', protect, refreshBadges);

// Bookmarks
router.get('/bookmarks', protect, getBookmarks);
router.post('/bookmarks/:projectId', protect, toggleBookmark);

// Public profiles — supports both ObjectId and username
router.get('/profile/:id/stats', protect, getProfileStats);
router.get('/profile/:id/projects', protect, getProfileProjects);
router.get('/profile/:id', protect, getPublicProfile);
router.get('/badges/:id', protect, getUserBadges);

export default router;
