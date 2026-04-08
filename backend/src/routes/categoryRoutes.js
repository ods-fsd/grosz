import express from 'express';
import {
    createCategory,
    getCategories
} from '../controllers/categoryController.js';
import {
    protect
} from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, createCategory)
    .get(protect, getCategories);

export default router;