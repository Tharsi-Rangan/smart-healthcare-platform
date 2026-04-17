import { Router } from 'express';
import { generateVideoToken, getConsultationSession } from '../controllers/consultation.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Video consultation routes
router.post('/video-token', authMiddleware, generateVideoToken);
router.get('/session/:appointmentId', authMiddleware, getConsultationSession);

export default router;
