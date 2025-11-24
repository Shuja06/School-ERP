// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const protect = require('../middleware/authMiddleware');

// Get current user info
router.get('/me', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        id: req.user.id,
        email: req.user.email,
        full_name: req.user.full_name,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user info',
      error: error.message
    });
  }
});

// Get all users (Admin only)
router.get('/', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const users = await User.find().select('-password').sort({ created_at: -1 });
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// Update user role (Admin only)
router.put('/:id/role', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { role } = req.body;
    
    // Validate role
    if (!['admin', 'accountant', 'teacher', 'principal'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be: admin, accountant, teacher, or principal'
      });
    }
    
    const user = await User.findOne({ id: req.params.id });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent admin from removing their own admin role
    if (user.id === req.user.id && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You cannot remove your own admin role'
      });
    }
    
    user.role = role;
    await user.save();
    
    res.json({
      success: true,
      message: 'User role updated successfully',
      data: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
      error: error.message
    });
  }
});

module.exports = router;