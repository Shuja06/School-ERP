// models/Settings.js
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // School Information
  school_name: {
    type: String,
    default: 'Greenwood High School'
  },
  school_code: {
    type: String,
    default: 'GHS-2024'
  },
  address: {
    type: String,
    default: '123 Education Street, City'
  },
  phone: {
    type: String,
    default: '+91 98765 43210'
  },
  email: {
    type: String,
    default: 'admin@greenwood.edu'
  },
  
  // Notification Settings
  notifications: {
    email_enabled: { type: Boolean, default: true },
    sms_enabled: { type: Boolean, default: true },
    whatsapp_enabled: { type: Boolean, default: false },
    payment_reminders: { type: Boolean, default: true }
  },
  
  // Security Settings
  security: {
    two_factor_auth: { type: Boolean, default: false },
    audit_logging: { type: Boolean, default: true },
    auto_logout: { type: Boolean, default: true }
  },
  
  // Data Management
  data_management: {
    auto_backup: { type: Boolean, default: true },
    last_backup: { type: Date, default: Date.now }
  }
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

module.exports = mongoose.model('Settings', settingsSchema);