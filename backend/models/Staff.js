// models/Staff.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const StaffSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  staff_id: {
    type: String,
    required: [true, 'Staff ID is required'],
    unique: true,
    trim: true
  },
  full_name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  designation: {
    type: String,
    required: [true, 'Designation is required'],
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/.+@.+\..+/, 'Please fill a valid email address']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 15
  },
  salary: {
    type: Number,
    required: [true, 'Salary is required'],
    min: 0
  },
  joining_date: {
    type: Date,
    default: Date.now
  },
  is_active: {
    type: Boolean,
    default: true
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

// Pre-save hook to ensure id is generated
StaffSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = uuidv4();
  }
  this.updated_at = Date.now();
  next();
});

// Transform the output to include id field
StaffSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret.id || ret._id.toString();
    return ret;
  }
});

module.exports = mongoose.model('Staff', StaffSchema);