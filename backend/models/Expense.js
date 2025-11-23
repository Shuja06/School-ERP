// models/Expense.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ExpenseSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  amount: { 
    type: Number,
    required: true
  },
  expense_date: {
    type: Date,
    default: Date.now
  },
  payment_method: String,
  receipt_number: String,
  created_by: {
    type: String,
    ref: 'User'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
// FIX: Removed { _id: false } below
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

ExpenseSchema.pre('save', function(next) {
    if (!this.id) this.id = uuidv4();
    this.updated_at = Date.now();
    next();
});

module.exports = mongoose.model('Expense', ExpenseSchema);