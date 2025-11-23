// routes/staffRoutes.js
const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const auth = require('../middleware/authMiddleware');

// Protect all staff routes
router.use(auth);

// GET /api/v1/staff - Get all staff members
router.get('/', async (req, res) => {
  try {
    const staff = await Staff.find().sort({ created_at: -1 });
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/v1/staff/:id - Get a single staff member by ID
router.get('/:id', async (req, res) => {
  try {
    // Try to find by custom 'id' field first
    let staff = await Staff.findOne({ id: req.params.id });
    
    if (!staff) {
      // If not found by custom id, try MongoDB _id
      staff = await Staff.findById(req.params.id);
    }
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff member:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/v1/staff - Create a new staff member
router.post('/', async (req, res) => {
  const {
    staff_id,
    full_name,
    designation,
    department,
    email,
    phone,
    salary,
    joining_date
  } = req.body;

  try {
    // Check if staff_id already exists
    const existingStaff = await Staff.findOne({ staff_id });
    if (existingStaff) {
      return res.status(400).json({ message: 'Staff ID already exists' });
    }

    const newStaff = new Staff({
      staff_id,
      full_name,
      designation,
      department,
      email,
      phone,
      salary: Number(salary),
      joining_date: joining_date || new Date()
    });

    const staff = await newStaff.save();
    res.status(201).json(staff);
  } catch (error) {
    console.error('Error creating staff:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Staff ID or email already exists' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || 'Server Error' });
  }
});

// PUT /api/v1/staff/:id - Update a staff member by ID
router.put('/:id', async (req, res) => {
  const updatedFields = req.body;

  try {
    // Try to find by custom 'id' field first
    let staff = await Staff.findOne({ id: req.params.id });
    
    if (!staff) {
      // If not found by custom id, try MongoDB _id
      staff = await Staff.findById(req.params.id);
    }

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Update the staff member
    Object.assign(staff, updatedFields);
    await staff.save();

    res.json(staff);
  } catch (error) {
    console.error('Error updating staff:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || 'Server Error' });
  }
});

// DELETE /api/v1/staff/:id - Delete a staff member by ID
router.delete('/:id', async (req, res) => {
  try {
    // Try to find by custom 'id' field first
    let result = await Staff.findOneAndDelete({ id: req.params.id });
    
    if (!result) {
      // If not found by custom id, try MongoDB _id
      result = await Staff.findByIdAndDelete(req.params.id);
    }

    if (!result) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    res.json({ message: 'Staff member deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
});

module.exports = router;