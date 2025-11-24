// routes/settingsRoutes.js
const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const protect = require('../middleware/authMiddleware');

// Get settings
router.get('/', protect, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching settings',
      error: error.message
    });
  }
});

// Update school information (Admin only)
router.put('/school', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { school_name, school_code, address, phone, email } = req.body;
    
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
    }
    
    if (school_name) settings.school_name = school_name;
    if (school_code) settings.school_code = school_code;
    if (address) settings.address = address;
    if (phone) settings.phone = phone;
    if (email) settings.email = email;
    
    await settings.save();
    
    res.json({
      success: true,
      message: 'School information updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error updating school info:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating school information',
      error: error.message
    });
  }
});

// Update notification settings (Admin only)
router.put('/notifications', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { email_enabled, sms_enabled, whatsapp_enabled, payment_reminders } = req.body;
    
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();
    
    if (email_enabled !== undefined) settings.notifications.email_enabled = email_enabled;
    if (sms_enabled !== undefined) settings.notifications.sms_enabled = sms_enabled;
    if (whatsapp_enabled !== undefined) settings.notifications.whatsapp_enabled = whatsapp_enabled;
    if (payment_reminders !== undefined) settings.notifications.payment_reminders = payment_reminders;
    
    await settings.save();
    
    res.json({
      success: true,
      message: 'Notification settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error updating notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification settings',
      error: error.message
    });
  }
});

// Update security settings (Admin only)
router.put('/security', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { two_factor_auth, audit_logging, auto_logout } = req.body;
    
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();
    
    if (two_factor_auth !== undefined) settings.security.two_factor_auth = two_factor_auth;
    if (audit_logging !== undefined) settings.security.audit_logging = audit_logging;
    if (auto_logout !== undefined) settings.security.auto_logout = auto_logout;
    
    await settings.save();
    
    res.json({
      success: true,
      message: 'Security settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error updating security settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating security settings',
      error: error.message
    });
  }
});

// Update data management settings (Admin only)
router.put('/data-management', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { auto_backup } = req.body;
    
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();
    
    if (auto_backup !== undefined) settings.data_management.auto_backup = auto_backup;
    
    await settings.save();
    
    res.json({
      success: true,
      message: 'Data management settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error updating data management:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating data management settings',
      error: error.message
    });
  }
});

// Trigger backup (Admin only)
router.post('/backup', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();
    
    settings.data_management.last_backup = new Date();
    await settings.save();
    
    res.json({
      success: true,
      message: 'Backup completed successfully',
      data: {
        last_backup: settings.data_management.last_backup
      }
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating backup',
      error: error.message
    });
  }
});

module.exports = router;