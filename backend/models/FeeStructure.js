// models/FeeStructure.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const FeeStructureSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  class: {
    type: String,
    required: true
  },
  fee_type: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  academic_year: {
    type: String,
    required: true
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

FeeStructureSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = uuidv4();
  }
  this.updated_at = Date.now();
  next();
});

// Transform the output to include id field
FeeStructureSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret.id || ret._id.toString();
    return ret;
  }
});

module.exports = mongoose.model('FeeStructure', FeeStructureSchema);