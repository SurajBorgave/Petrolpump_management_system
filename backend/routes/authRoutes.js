const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  registerValidation,
  loginValidation,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/login', loginValidation, login);

// Admin only
router.post('/register', protect, authorize('admin'), registerValidation, register);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/status', protect, authorize('admin'), updateUserStatus);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

// Authenticated
router.get('/me', protect, getMe);

module.exports = router;
