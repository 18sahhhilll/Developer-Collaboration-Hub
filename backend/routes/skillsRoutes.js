import express from 'express';
import { getSkills } from '../controllers/skillsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getSkills);

export default router;
