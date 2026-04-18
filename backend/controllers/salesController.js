const { body } = require('express-validator');
const PDFDocument = require('pdfkit');
const Sale = require('../models/Sale');
const Fuel = require('../models/Fuel');
const validate = require('../middleware/validate');

// Validation rules
const saleValidation = [
  body('fuelType').notEmpty().withMessage('Fuel type is required'),
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isFloat({ min: 0.1 }).withMessage('Quantity must be greater than 0'),
  body('customerName').optional().trim(),
  body('vehicleNumber').optional().trim(),
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'card', 'upi']).withMessage('Payment method must be cash, card, or upi'),
  validate,
];

// @desc    Create a new sale
// @route   POST /api/sales
const createSale = async (req, res, next) => {
  try {
    const { fuelType, quantity, customerName, vehicleNumber, paymentMethod } = req.body;

    // Get fuel details
    const fuel = await Fuel.findById(fuelType);
    if (!fuel) {
      return res.status(404).json({ success: false, message: 'Fuel type not found.' });
    }

    if (!fuel.isActive) {
      return res.status(400).json({ success: false, message: 'This fuel type is not available.' });
    }

    if (fuel.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${fuel.stock}L, Requested: ${quantity}L`,
      });
    }

    // Auto calculate total amount
    let totalAmount = parseFloat((fuel.pricePerLiter * quantity).toFixed(2));
    if (paymentMethod === 'cash' || !paymentMethod) {
      totalAmount = Math.round(totalAmount);
    }

    // Create sale
    const sale = await Sale.create({
      fuelType: fuel._id,
      fuelName: fuel.name,
      quantity,
      pricePerLiter: fuel.pricePerLiter,
      totalAmount,
      staffId: req.user._id,
      staffName: req.user.name,
      customerName: customerName || 'Walk-in Customer',
      vehicleNumber: vehicleNumber || '',
      paymentMethod: paymentMethod || 'cash',
      date: new Date(),
    });

    // Reduce stock
    fuel.stock = parseFloat((fuel.stock - quantity).toFixed(2));
    await fuel.save();

    res.status(201).json({
      success: true,
      message: 'Sale recorded successfully.',
      data: { sale },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all sales with optional date filter
// @route   GET /api/sales
const getAllSales = async (req, res, next) => {
  try {
    const { date, startDate, endDate, fuelType, staffId, page = 1, limit = 20 } = req.query;

    const query = {};

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    if (fuelType) query.fuelType = fuelType;

    // Staff can only see their own sales
    if (req.user.role === 'staff') {
      query.staffId = req.user._id;
    } else if (staffId) {
      query.staffId = staffId;
    }

    const skip = (page - 1) * limit;
    const total = await Sale.countDocuments(query);
    const sales = await Sale.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('fuelType', 'name pricePerLiter')
      .populate('staffId', 'name email');

    res.json({
      success: true,
      count: sales.length,
      total,
      pages: Math.ceil(total / limit),
      data: { sales },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single sale
// @route   GET /api/sales/:id
const getSaleById = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('fuelType', 'name pricePerLiter')
      .populate('staffId', 'name email');

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale not found.' });
    }

    res.json({ success: true, data: { sale } });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate PDF bill for a sale
// @route   GET /api/sales/:id/bill
const generateBill = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('fuelType', 'name')
      .populate('staffId', 'name');

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale not found.' });
    }

    // Thermal Receipt dimensions (e.g., 3-inch roll format) for an authentic look
    const doc = new PDFDocument({ size: [300, 500], margin: 20 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Receipt-${sale.billNumber}.pdf`
    );

    doc.pipe(res);

    // ---- Receipt Border ----
    doc.roundedRect(10, 10, 280, 480, 10).strokeColor('#e2e8f0').lineWidth(1).stroke();
    
    // ---- Header ----
    doc.fillColor('#1a202c').fontSize(16).font('Helvetica-Bold').text('PETROL PUMP PRO', { align: 'center', marginTop: 15 });
    doc.fontSize(9).font('Helvetica').text('123 Highway Revenue Road, MH', { align: 'center' });
    doc.fontSize(8).text('GSTIN: 27AABCT2388Q1Z3', { align: 'center' });
    doc.fontSize(8).text('Phone: +91 9876543210', { align: 'center' });
    
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica-Bold').text('TAX INVOICE', { align: 'center' });
    
    doc.moveDown(0.3);
    doc.moveTo(15, doc.y).lineTo(285, doc.y).dash(3, { space: 3 }).strokeColor('#cbd5e0').stroke();
    doc.undash();
    doc.moveDown(0.5);
    
    // ---- Meta Info ----
    const d = new Date(sale.date);
    doc.fontSize(9).font('Helvetica-Bold').text('Bill No : ', 20, doc.y, { continued: true }).font('Helvetica').text(sale.billNumber);
    doc.font('Helvetica-Bold').text('Date    : ', 20, doc.y, { continued: true }).font('Helvetica').text(d.toLocaleDateString('en-IN') + ' ' + d.toLocaleTimeString('en-IN'));
    
    doc.font('Helvetica-Bold').text('User    : ', 20, doc.y, { continued: true }).font('Helvetica').text(sale.customerName || 'Walk-in Customer');
    if (sale.vehicleNumber) {
        doc.font('Helvetica-Bold').text('Vehicle : ', 20, doc.y, { continued: true }).font('Helvetica').text(sale.vehicleNumber);
    }
    doc.font('Helvetica-Bold').text('Pay Mode: ', 20, doc.y, { continued: true }).font('Helvetica').text(sale.paymentMethod.toUpperCase());
    doc.font('Helvetica-Bold').text('Nozzle  : ', 20, doc.y, { continued: true }).font('Helvetica').text('NZ-01 (' + sale.staffName + ')');

    doc.moveDown(0.5);
    doc.moveTo(15, doc.y).lineTo(285, doc.y).dash(3, { space: 3 }).strokeColor('#cbd5e0').stroke();
    doc.undash();
    doc.moveDown(0.5);

    // ---- Table Header ----
    const startY = doc.y;
    doc.font('Helvetica-Bold').fontSize(8);
    doc.text('ITEM', 20, startY);
    doc.text('RATE', 130, startY);
    doc.text('QTY(L)', 180, startY);
    doc.text('AMOUNT', 225, startY, { width: 55, align: 'right' });
    
    doc.moveDown(0.3);
    doc.moveTo(15, doc.y).lineTo(285, doc.y).strokeColor('#cbd5e0').stroke();
    doc.moveDown(0.3);

    // ---- Table Row ----
    const itemY = doc.y;
    doc.font('Helvetica-Bold').fontSize(9);
    doc.text(sale.fuelName.toUpperCase(), 20, itemY);
    doc.font('Helvetica');
    doc.text(sale.pricePerLiter.toFixed(2), 130, itemY);
    doc.text(sale.quantity.toFixed(2), 180, itemY);
    doc.font('Helvetica-Bold');
    doc.text(sale.totalAmount.toFixed(2), 225, itemY, { width: 55, align: 'right' });

    doc.moveDown(1.2);
    doc.moveTo(15, doc.y).lineTo(285, doc.y).dash(3, { space: 3 }).strokeColor('#cbd5e0').stroke();
    doc.undash();
    doc.moveDown(0.8);

    // ---- Totals ----
    doc.font('Helvetica-Bold').fontSize(14);
    doc.text('TOTAL:', 20, doc.y, { continued: true });
    doc.text(`Rs. ${sale.totalAmount.toFixed(2)}`, 100, doc.y, { align: 'right', width: 180 });
    
    // ---- Tax details ----
    doc.moveDown(0.8);
    doc.font('Helvetica').fontSize(8);
    const taxAmt = (sale.totalAmount * 0.18).toFixed(2);
    const baseAmt = (sale.totalAmount - taxAmt).toFixed(2);
    doc.text(`Includes Base Price Rs. ${baseAmt}`, { align: 'center' });
    doc.text(`Includes GST (18%) Rs. ${taxAmt}`, { align: 'center' });

    doc.moveDown(1.5);
    doc.moveTo(15, doc.y).lineTo(285, doc.y).dash(3, { space: 3 }).strokeColor('#cbd5e0').stroke();
    doc.undash();

    // ---- Footer ----
    doc.moveDown(1);
    doc.font('Helvetica-Bold').fontSize(10).text('THANK YOU FOR YOUR VISIT!', { align: 'center' });
    doc.font('Helvetica').fontSize(9).text('DRIVE SAFE. SAVE FUEL.', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(7).fillColor('#a0aec0').text('Generated by PetrolPump Pro Systems', { align: 'center' });

    doc.end();
  } catch (error) {
    next(error);
  }
};

// @desc    Get sales reports
// @route   GET /api/sales/reports
const getReports = async (req, res, next) => {
  try {
    const { type = 'daily', month, year } = req.query;

    const now = new Date();
    const currentYear = parseInt(year) || now.getFullYear();
    const currentMonth = parseInt(month) || now.getMonth() + 1;

    let report = {};

    if (type === 'daily') {
      // Today's report
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const sales = await Sale.find({ date: { $gte: todayStart, $lte: todayEnd } });
      const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
      const totalLiters = sales.reduce((sum, s) => sum + s.quantity, 0);

      report = {
        type: 'daily',
        date: todayStart.toISOString().split('T')[0],
        totalSales: sales.length,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalLiters: parseFloat(totalLiters.toFixed(2)),
        sales,
      };
    } else if (type === 'monthly') {
      // Monthly aggregation
      const monthStart = new Date(currentYear, currentMonth - 1, 1);
      const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

      const dailyAgg = await Sale.aggregate([
        { $match: { date: { $gte: monthStart, $lte: monthEnd } } },
        {
          $group: {
            _id: { $dayOfMonth: '$date' },
            totalRevenue: { $sum: '$totalAmount' },
            totalLiters: { $sum: '$quantity' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const totalRevenue = dailyAgg.reduce((s, d) => s + d.totalRevenue, 0);
      const totalLiters = dailyAgg.reduce((s, d) => s + d.totalLiters, 0);
      const totalSales = dailyAgg.reduce((s, d) => s + d.count, 0);

      report = {
        type: 'monthly',
        month: currentMonth,
        year: currentYear,
        totalSales,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalLiters: parseFloat(totalLiters.toFixed(2)),
        breakdown: dailyAgg,
      };
    } else if (type === 'fuel') {
      // Fuel-wise report for current month
      const monthStart = new Date(currentYear, currentMonth - 1, 1);
      const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

      const fuelAgg = await Sale.aggregate([
        { $match: { date: { $gte: monthStart, $lte: monthEnd } } },
        {
          $group: {
            _id: '$fuelName',
            totalRevenue: { $sum: '$totalAmount' },
            totalLiters: { $sum: '$quantity' },
            count: { $sum: 1 },
            avgPrice: { $avg: '$pricePerLiter' },
          },
        },
        { $sort: { totalRevenue: -1 } },
      ]);

      report = {
        type: 'fuel',
        month: currentMonth,
        year: currentYear,
        breakdown: fuelAgg,
      };
    } else if (type === 'staff') {
      // Staff-wise report for current month
      const monthStart = new Date(currentYear, currentMonth - 1, 1);
      const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

      const staffAgg = await Sale.aggregate([
        { $match: { date: { $gte: monthStart, $lte: monthEnd } } },
        {
          $group: {
            _id: { staffId: '$staffId', staffName: '$staffName' },
            totalRevenue: { $sum: '$totalAmount' },
            totalLiters: { $sum: '$quantity' },
            count: { $sum: 1 },
          },
        },
        { $sort: { totalRevenue: -1 } },
      ]);

      report = {
        type: 'staff',
        month: currentMonth,
        year: currentYear,
        breakdown: staffAgg.map((s) => ({
          staffName: s._id.staffName,
          staffId: s._id.staffId,
          totalRevenue: parseFloat(s.totalRevenue.toFixed(2)),
          totalLiters: parseFloat(s.totalLiters.toFixed(2)),
          count: s.count,
        })),
      };
    }

    res.json({ success: true, data: { report } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard summary
// @route   GET /api/sales/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);

    const matchStaff = req.user.role === 'staff' ? { staffId: req.user._id } : {};

    const [todaySales, monthSales, fuelStocks, recentSales] = await Promise.all([
      Sale.aggregate([
        { $match: { ...matchStaff, date: { $gte: todayStart, $lte: todayEnd } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            totalLiters: { $sum: '$quantity' },
            count: { $sum: 1 },
          },
        },
      ]),
      Sale.aggregate([
        { $match: { ...matchStaff, date: { $gte: monthStart } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            count: { $sum: 1 },
          },
        },
      ]),
      require('../models/Fuel').find({ isActive: true }).select('name stock pricePerLiter'),
      Sale.find(matchStaff)
        .sort({ date: -1 })
        .limit(5)
        .select('billNumber fuelName quantity totalAmount date customerName'),
    ]);

    res.json({
      success: true,
      data: {
        today: todaySales[0] || { totalRevenue: 0, totalLiters: 0, count: 0 },
        thisMonth: monthSales[0] || { totalRevenue: 0, count: 0 },
        fuelStocks,
        recentSales,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSale,
  getAllSales,
  getSaleById,
  generateBill,
  getReports,
  getDashboard,
  saleValidation,
};
