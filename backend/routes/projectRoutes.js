import express from 'express';
import {
  createProject,
  getProjects,
  getProjectsWithMatch,
  getProjectById,
  updateProject,
  deleteProject,
  getMyProjects,
  getDashboardStats,
  getFeed,
  searchProjectsHandler,
  getWorkspaceProjects,
} from '../controllers/projectController.js';
import { removeMember, transferOwnership, promoteCoLeader } from '../controllers/teamController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/feed', getFeed);
router.get('/workspace', getWorkspaceProjects);
router.get('/search', searchProjectsHandler);
router.get('/match', getProjectsWithMatch);
router.get('/stats', getDashboardStats);
router.get('/my', getMyProjects);
router.route('/').get(getProjects).post(createProject);
router.delete('/:id/members/:userId', removeMember);
router.put('/:id/transfer-ownership', transferOwnership);
router.put('/:id/members/:userId/promote', promoteCoLeader);
router.route('/:id').get(getProjectById).put(updateProject).delete(deleteProject);

export default router;
