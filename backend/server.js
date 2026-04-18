require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const fuelRoutes = require('./routes/fuelRoutes');
const salesRoutes = require('./routes/salesRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// ---- Middleware ----
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow any localhost port
    if (/^http:\/\/localhost(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    // Allow Vercel deployment domains
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger (dev)
if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// ---- API Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/sales', salesRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Petrol Pump API is running',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// Global error handler
app.use(errorHandler);

// Only start listening when running locally (not in Vercel serverless)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api\n`);
  });
}

module.exports = app;
