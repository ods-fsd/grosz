import express from 'express';
import {
    createTransaction,
    updateTransactionStatus,
    deleteTransaction,
    getTransactions
} from '../controllers/transactionController.js';
import {
    protect
} from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createTransaction);
router.patch('/:id', protect, updateTransactionStatus);
router.delete('/:id', protect, deleteTransaction);
router.get('/', protect, getTransactions);

export default router;