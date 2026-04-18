const express = require('express');
const router = express.Router();
const {
  addFuel,
  getAllFuels,
  getFuelById,
  updateFuel,
  addStock,
  fuelValidation,
  updateFuelValidation,
} = require('../controllers/fuelController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.get('/', getAllFuels);
router.get('/:id', getFuelById);
router.post('/', authorize('admin'), fuelValidation, addFuel);
router.put('/:id', authorize('admin'), updateFuelValidation, updateFuel);
router.put('/:id/addstock', authorize('admin'), addStock);

module.exports = router;
