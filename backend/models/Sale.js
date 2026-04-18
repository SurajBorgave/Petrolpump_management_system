const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema(
  {
    fuelType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fuel',
      required: [true, 'Fuel type is required'],
    },
    fuelName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.1, 'Quantity must be greater than 0'],
    },
    pricePerLiter: {
      type: Number,
      required: [true, 'Price per liter is required'],
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    staffName: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      trim: true,
      default: 'Walk-in Customer',
    },
    vehicleNumber: {
      type: String,
      trim: true,
      default: '',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi'],
      default: 'cash',
    },
    billNumber: {
      type: String,
      unique: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate bill number before saving
saleSchema.pre('save', async function (next) {
  if (!this.billNumber) {
    const count = await mongoose.model('Sale').countDocuments();
    const timestamp = Date.now().toString().slice(-6);
    this.billNumber = `BILL-${timestamp}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Sale', saleSchema);
