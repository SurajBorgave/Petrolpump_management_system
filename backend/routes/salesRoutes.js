const express = require('express');
const router = express.Router();
const {
  createSale,
  getAllSales,
  getSaleById,
  generateBill,
  getReports,
  getDashboard,
  saleValidation,
} = require('../controllers/salesController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/reports', authorize('admin'), getReports);
router.get('/', getAllSales);
router.get('/:id', getSaleById);
router.get('/:id/bill', generateBill);
router.post('/', saleValidation, createSale);

module.exports = router;
