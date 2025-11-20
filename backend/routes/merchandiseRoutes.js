import express from 'express';
import {
  getMerchandise,
  getMerchandiseById,
  getAllMerchandise,
  createMerchandise,
  updateMerchandise,
  deleteMerchandise,
  createMerchandiseCheckout,
  verifyMerchandiseOrder,
  getOrderHistory
} from '../controllers/merchandiseController.js';
import { verifyToken } from '../middleware/auth.js';
import { uploadMerchandiseImage } from '../middleware/merchandiseUploadMiddleware.js';

const router = express.Router();

// Admin routes (require authentication and admin role) - MUST come before /:id route
router.get('/admin/all', verifyToken, getAllMerchandise);
router.post('/admin/create', verifyToken, uploadMerchandiseImage, createMerchandise);
router.put('/admin/:id', verifyToken, uploadMerchandiseImage, updateMerchandise);
router.delete('/admin/:id', verifyToken, deleteMerchandise);

// Student routes (require authentication)
router.post('/checkout', verifyToken, createMerchandiseCheckout);
router.get('/orders/history', verifyToken, getOrderHistory);
router.get('/orders/verify', verifyMerchandiseOrder);

// Public routes (for students to view merchandise) - MUST come last
router.get('/', getMerchandise);
router.get('/:id', getMerchandiseById);

export default router;

