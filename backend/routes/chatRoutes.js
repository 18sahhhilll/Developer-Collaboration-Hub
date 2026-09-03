import express from 'express';
import { getChatByProject, getMyChats, sendMessage } from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getMyChats);
router.get('/:projectId', getChatByProject);
router.post('/:projectId', sendMessage);

export default router;
