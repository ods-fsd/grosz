import express from 'express';
import {
    getDashboardStats,
    getCategoryBreakdown
} from '../controllers/analyticsController.js';
import {
    protect
} from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, getDashboardStats);
router.get('/categories', protect, getCategoryBreakdown);

export default router;