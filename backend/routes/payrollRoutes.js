// routes/payrollRoutes.js
const express = require('express');
const router = express.Router();
const Payroll = require('../models/Payroll');
const Staff = require('../models/Staff');
const auth = require('../middleware/authMiddleware');

router.use(auth); // Protect all payroll routes

// GET /api/v1/payroll - Get all payroll records with staff data
router.get('/', async (req, res) => {
  try {
    const payrolls = await Payroll.find().sort({ created_at: -1 });
    
    // Manually populate staff data since we're using custom 'id' field
    const formattedPayrolls = await Promise.all(
      payrolls.map(async (payroll) => {
        const payrollObj = payroll.toObject();
        
        // Find staff by custom 'id' field
        const staff = await Staff.findOne({ id: payroll.staff_id });
        
        // Add staff data in the format expected by frontend
        payrollObj.staff = staff ? {
          full_name: staff.full_name,
          designation: staff.designation,
          department: staff.department
        } : null;
        
        return payrollObj;
      })
    );

    res.json(formattedPayrolls);
  } catch (err) {
    console.error('Error fetching payroll:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/v1/payroll - Create payroll record
router.post('/', async (req, res) => {
  const {
    staff_id,
    month,
    basic_salary,
    allowances,
    deductions,
    payment_status,
    payment_date,
    payment_method,
    notes
  } = req.body;

  try {
    // Check if payroll already exists for this staff and month
    const existingPayroll = await Payroll.findOne({ staff_id, month });
    if (existingPayroll) {
      return res.status(400).json({ message: 'Payroll already exists for this staff member and month' });
    }

    // Calculate net salary
    const net_salary = Number(basic_salary) + Number(allowances || 0) - Number(deductions || 0);

    const newPayroll = new Payroll({
      staff_id,
      month,
      basic_salary: Number(basic_salary),
      allowances: Number(allowances || 0),
      deductions: Number(deductions || 0),
      net_salary,
      payment_status: payment_status || 'pending',
      payment_date,
      payment_method,
      notes
    });

    const payroll = await newPayroll.save();
    res.status(201).json(payroll);
  } catch (err) {
    console.error('Error creating payroll:', err);
    res.status(500).json({ message: err.message || 'Server Error' });
  }
});

// PUT /api/v1/payroll/:id - Update payroll record
router.put('/:id', async (req, res) => {
  try {
    // Try to find by custom 'id' field first
    let payroll = await Payroll.findOne({ id: req.params.id });
    
    if (!payroll) {
      // If not found by custom id, try MongoDB _id
      payroll = await Payroll.findById(req.params.id);
    }

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    // Update fields
    Object.assign(payroll, req.body);
    
    // Recalculate net salary
    payroll.net_salary = Number(payroll.basic_salary) + Number(payroll.allowances || 0) - Number(payroll.deductions || 0);
    
    await payroll.save();

    res.json(payroll);
  } catch (err) {
    console.error('Error updating payroll:', err);
    res.status(500).json({ message: err.message || 'Server Error' });
  }
});

// DELETE /api/v1/payroll/:id - Delete payroll record
router.delete('/:id', async (req, res) => {
  try {
    // Try to find by custom 'id' field first
    let result = await Payroll.findOneAndDelete({ id: req.params.id });
    
    if (!result) {
      // If not found by custom id, try MongoDB _id
      result = await Payroll.findByIdAndDelete(req.params.id);
    }

    if (!result) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    res.json({ message: 'Payroll record deleted successfully', id: req.params.id });
  } catch (err) {
    console.error('Error deleting payroll:', err);
    res.status(500).json({ message: err.message || 'Server Error' });
  }
});

// POST /api/v1/payroll/bulk - Process payroll for all staff for a month
router.post('/bulk', async (req, res) => {
  const { month } = req.body;

  if (!month) {
    return res.status(400).json({ message: 'Month is required' });
  }

  try {
    // Get all active staff
    const allStaff = await Staff.find();
    
    const payrollRecords = [];
    const errors = [];

    for (const staff of allStaff) {
      try {
        // Check if payroll already exists
        const existing = await Payroll.findOne({ staff_id: staff.id, month });
        
        if (!existing) {
          const net_salary = Number(staff.salary);
          
          const payroll = new Payroll({
            staff_id: staff.id,
            month,
            basic_salary: Number(staff.salary),
            allowances: 0,
            deductions: 0,
            net_salary,
            payment_status: 'pending'
          });
          
          await payroll.save();
          payrollRecords.push(payroll);
        }
      } catch (err) {
        errors.push({ staff_id: staff.id, error: err.message });
      }
    }

    res.status(201).json({
      message: 'Bulk payroll processed',
      created: payrollRecords.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    console.error('Error processing bulk payroll:', err);
    res.status(500).json({ message: err.message || 'Server Error' });
  }
});

module.exports = router;