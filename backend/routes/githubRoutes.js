import express from 'express';
import { getGithubData, refreshGithubData } from '../controllers/githubController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, (req, res, next) => {
  req.params.id = req.user._id.toString();
  return getGithubData(req, res, next);
});
router.post('/refresh', protect, refreshGithubData);
router.get('/:id', protect, getGithubData);

export default router;
