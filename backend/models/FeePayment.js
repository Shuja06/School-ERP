// models/FeePayment.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const FeePaymentSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  student_id: {
    type: String,
    ref: 'Student',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  payment_date: {
    type: Date,
    default: Date.now
  },
  payment_method: {
    type: String,
    required: true,
    enum: ['Cash', 'Card', 'UPI', 'Net Banking', 'Cheque']
  },
  fee_type: {
    type: String,
    required: true
  },
  academic_year: {
    type: String,
    required: true
  },
  receipt_number: {
    type: String,
    unique: true,
    required: true
  },
  class: {
    type: String
  },
  created_by: {
    type: String,
    ref: 'User'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

FeePaymentSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = uuidv4();
  }
  next();
});

// Transform the output to include id field
FeePaymentSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret.id || ret._id.toString();
    return ret;
  }
});

module.exports = mongoose.model('FeePayment', FeePaymentSchema);