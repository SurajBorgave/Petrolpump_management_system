const { body, param } = require('express-validator');
const Fuel = require('../models/Fuel');
const validate = require('../middleware/validate');

// Validation rules
const fuelValidation = [
  body('name')
    .notEmpty().withMessage('Fuel name is required')
    .isIn(['Petrol', 'Diesel', 'CNG']).withMessage('Fuel must be Petrol, Diesel, or CNG'),
  body('pricePerLiter')
    .notEmpty().withMessage('Price per liter is required')
    .isFloat({ min: 0.01 }).withMessage('Price must be a positive number'),
  body('stock')
    .optional()
    .isFloat({ min: 0 }).withMessage('Stock cannot be negative'),
  validate,
];

const updateFuelValidation = [
  body('pricePerLiter')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('Price must be a positive number'),
  body('stock')
    .optional()
    .isFloat({ min: 0 }).withMessage('Stock cannot be negative'),
  validate,
];

// @desc    Add new fuel type (Admin only)
// @route   POST /api/fuel
const addFuel = async (req, res, next) => {
  try {
    const { name, pricePerLiter, stock } = req.body;

    const existing = await Fuel.findOne({ name });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `${name} already exists. Use update to modify.`,
      });
    }

    const fuel = await Fuel.create({ name, pricePerLiter, stock: stock || 0 });

    res.status(201).json({
      success: true,
      message: 'Fuel added successfully.',
      data: { fuel },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all fuels
// @route   GET /api/fuel
const getAllFuels = async (req, res, next) => {
  try {
    const fuels = await Fuel.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, count: fuels.length, data: { fuels } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single fuel
// @route   GET /api/fuel/:id
const getFuelById = async (req, res, next) => {
  try {
    const fuel = await Fuel.findById(req.params.id);
    if (!fuel) {
      return res.status(404).json({ success: false, message: 'Fuel not found.' });
    }
    res.json({ success: true, data: { fuel } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update fuel price/stock (Admin only)
// @route   PUT /api/fuel/:id
const updateFuel = async (req, res, next) => {
  try {
    const { pricePerLiter, stock, name } = req.body;

    const fuel = await Fuel.findById(req.params.id);
    if (!fuel) {
      return res.status(404).json({ success: false, message: 'Fuel not found.' });
    }

    if (pricePerLiter !== undefined) fuel.pricePerLiter = pricePerLiter;
    if (stock !== undefined) fuel.stock = stock;
    if (name) fuel.name = name;

    await fuel.save();

    res.json({ success: true, message: 'Fuel updated successfully.', data: { fuel } });
  } catch (error) {
    next(error);
  }
};

// @desc    Add stock to fuel (Admin only)
// @route   PUT /api/fuel/:id/addstock
const addStock = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be positive.' });
    }

    const fuel = await Fuel.findByIdAndUpdate(
      req.params.id,
      { $inc: { stock: amount } },
      { new: true }
    );
    if (!fuel) {
      return res.status(404).json({ success: false, message: 'Fuel not found.' });
    }

    res.json({ success: true, message: `Added ${amount}L to ${fuel.name} stock.`, data: { fuel } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addFuel,
  getAllFuels,
  getFuelById,
  updateFuel,
  addStock,
  fuelValidation,
  updateFuelValidation,
};
