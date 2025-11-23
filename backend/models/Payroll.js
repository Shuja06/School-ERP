// models/Payroll.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const PayrollSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  staff_id: {
    type: String,
    ref: 'Staff',
    required: true
  },
  month: {
    type: String,
    required: true // Format: "2024-11" or "November 2024"
  },
  basic_salary: {
    type: Number,
    required: true
  },
  allowances: {
    type: Number,
    default: 0
  },
  deductions: {
    type: Number,
    default: 0
  },
  net_salary: {
    type: Number,
    required: true
  },
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'processing'],
    default: 'pending'
  },
  payment_date: {
    type: Date
  },
  payment_method: {
    type: String,
    enum: ['Bank Transfer', 'Cash', 'Cheque', 'UPI']
  },
  notes: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

PayrollSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = uuidv4();
  }
  
  // Auto-calculate net salary if not provided
  if (!this.net_salary) {
    this.net_salary = this.basic_salary + (this.allowances || 0) - (this.deductions || 0);
  }
  
  this.updated_at = Date.now();
  next();
});

// Transform the output to include id field
PayrollSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret.id || ret._id.toString();
    return ret;
  }
});

module.exports = mongoose.model('Payroll', PayrollSchema);