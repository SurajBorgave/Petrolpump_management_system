// Vercel Serverless Function entry point
// This wraps the Express app for Vercel's serverless runtime
const app = require('../backend/server');

module.exports = app;
