// server.js  ←  REPLACE EVERYTHING WITH THIS
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/school_erp';

// MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB error:', err.message);
    process.exit(1);
  });

// ===== CORS – THIS IS THE WINNING COMBINATION =====
app.use(cors()); // ← Allow everything first (we'll restrict in production later)

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Body parser
app.use(express.json());

// Routes
app.get('/', (req, res) => res.json({ message: 'Backend running 🔥' }));
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/students', require('./routes/studentRoutes'));
app.use('/api/v1/staff', require('./routes/staffRoutes'));
app.use('/api/v1/fees', require('./routes/feeRoutes'));
app.use('/api/v1/expenses', require('./routes/expenseRoutes'));
app.use('/api/v1/payroll', require('./routes/payrollRoutes'));
app.use('/api/v1/reports', require('./routes/reportRoutes'));
app.use('/api/v1/users', require('./routes/userRoutes'));         
app.use('/api/v1/settings', require('./routes/settingsRoutes')); 

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error' });
});

// Start
app.listen(PORT, () => {
  console.log(`🚀 Server live on http://localhost:${PORT}`);
});