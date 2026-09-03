import express from 'express';
import {
  applyToProject,
  getMyApplications,
  getProjectApplications,
  updateApplicationStatus,
  getDashboardApplications,
} from '../controllers/applicationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/my', getMyApplications);
router.get('/dashboard', getDashboardApplications);
router.post('/:projectId', applyToProject);
router.get('/project/:projectId', getProjectApplications);
router.put('/:id/status', updateApplicationStatus);

export default router;
