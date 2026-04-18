const mongoose = require('mongoose');

const fuelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Fuel name is required'],
      enum: ['Petrol', 'Diesel', 'CNG'],
      unique: true,
      trim: true,
    },
    pricePerLiter: {
      type: Number,
      required: [true, 'Price per liter is required'],
      min: [0, 'Price cannot be negative'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Fuel', fuelSchema);
