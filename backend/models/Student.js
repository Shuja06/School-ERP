// models/Student.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const StudentSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  student_id: {
    type: String,
    required: true,
    unique: true
  },
  full_name: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  section: String,
  parent_name: String,
  parent_contact: String,
  admission_date: {
    type: Date,
    default: Date.now
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
StudentSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = uuidv4();
  }
  this.updated_at = Date.now();
  next();
});

// Transform the output to include id field
StudentSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret.id || ret._id.toString();
    return ret;
  }
});

module.exports = mongoose.model('Student', StudentSchema);