// // routes/feeRoutes.js
// const express = require('express');
// const router = express.Router();
// const FeeStructure = require('../models/FeeStructure');
// const FeePayment = require('../models/FeePayment');
// const auth = require('../middleware/authMiddleware');

// router.use(auth); // Protect all fee routes

// // --- FEE STRUCTURES (FeeManagement.tsx) ---

// // GET /api/v1/fees/structures
// router.get('/structures', async (req, res) => {
//   try {
//     const structures = await FeeStructure.find().sort({ class: 1, fee_type: 1 });
//     res.json(structures);
//   } catch (err) {
//     console.error('Error fetching fee structures:', err);
//     res.status(500).json({ message: 'Server Error' });
//   }
// });

// // POST /api/v1/fees/structures
// router.post('/structures', async (req, res) => {
//   const { class: studentClass, fee_type, amount, academic_year } = req.body;
  
//   try {
//     const newStructure = new FeeStructure({ 
//       class: studentClass, 
//       fee_type, 
//       amount: Number(amount), 
//       academic_year 
//     });
    
//     const structure = await newStructure.save();
//     res.status(201).json(structure);
//   } catch (err) {
//     console.error('Error creating fee structure:', err);
//     res.status(500).json({ message: err.message || 'Server Error' });
//   }
// });

// // PUT /api/v1/fees/structures/:id
// router.put('/structures/:id', async (req, res) => {
//   const structureFields = req.body;
  
//   try {
//     // Try to find by custom 'id' field first
//     let structure = await FeeStructure.findOne({ id: req.params.id });
    
//     if (!structure) {
//       // If not found by custom id, try MongoDB _id
//       structure = await FeeStructure.findById(req.params.id);
//     }

//     if (!structure) {
//       return res.status(404).json({ message: 'Fee structure not found' });
//     }

//     // Update the structure
//     Object.assign(structure, structureFields);
//     await structure.save();

//     res.json(structure);
//   } catch (err) {
//     console.error('Error updating fee structure:', err);
//     res.status(500).json({ message: err.message || 'Server Error' });
//   }
// });

// // DELETE /api/v1/fees/structures/:id
// router.delete('/structures/:id', async (req, res) => {
//   try {
//     // Try to find by custom 'id' field first
//     let result = await FeeStructure.findOneAndDelete({ id: req.params.id });
    
//     if (!result) {
//       // If not found by custom id, try MongoDB _id
//       result = await FeeStructure.findByIdAndDelete(req.params.id);
//     }

//     if (!result) {
//       return res.status(404).json({ message: 'Fee structure not found' });
//     }

//     res.json({ message: 'Fee structure removed', id: req.params.id });
//   } catch (err) {
//     console.error('Error deleting fee structure:', err);
//     res.status(500).json({ message: err.message || 'Server Error' });
//   }
// });

// // --- FEE PAYMENTS (Billing.tsx) ---

// // GET /api/v1/fees/payments - Fetch all payments, populate student data for display
// router.get('/payments', async (req, res) => {
//   try {
//     const payments = await FeePayment.find()
//       .populate({ path: 'student_id', model: 'Student', select: 'full_name class section' }) 
//       .sort({ created_at: -1 });

//     // Format the output to match the expected frontend structure (payment.students.full_name)
//     const formattedPayments = payments.map(p => ({
//       ...p.toObject(),
//       students: p.student_id // Rename the populated field to 'students' for the frontend
//     }));

//     res.json(formattedPayments);
//   } catch (err) {
//     console.error('Error fetching payments:', err);
//     res.status(500).json({ message: 'Server Error' });
//   }
// });

// // POST /api/v1/fees/payments
// router.post('/payments', async (req, res) => {
//   const { student_id, amount, payment_method, fee_type, academic_year, receipt_number, class: studentClass } = req.body;
  
//   try {
//     const newPayment = new FeePayment({ 
//       student_id, 
//       amount: Number(amount), 
//       payment_method, 
//       fee_type, 
//       academic_year, 
//       receipt_number, 
//       class: studentClass,
//       created_by: req.user.id
//     });
    
//     const payment = await newPayment.save();
//     res.status(201).json(payment);
//   } catch (err) {
//     console.error('Error creating payment:', err);
//     res.status(500).json({ message: err.message || 'Server Error' });
//   }
// });

// // DELETE /api/v1/fees/payments/:id
// router.delete('/payments/:id', async (req, res) => {
//   try {
//     // Try to find by custom 'id' field first
//     let result = await FeePayment.findOneAndDelete({ id: req.params.id });
    
//     if (!result) {
//       // If not found by custom id, try MongoDB _id
//       result = await FeePayment.findByIdAndDelete(req.params.id);
//     }

//     if (!result) {
//       return res.status(404).json({ message: 'Payment not found' });
//     }

//     res.json({ message: 'Payment removed', id: req.params.id });
//   } catch (err) {
//     console.error('Error deleting payment:', err);
//     res.status(500).json({ message: err.message || 'Server Error' });
//   }
// });

// module.exports = router;





















// routes/feeRoutes.js
const express = require('express');
const router = express.Router();
const FeeStructure = require('../models/FeeStructure');
const FeePayment = require('../models/FeePayment');
const auth = require('../middleware/authMiddleware');

router.use(auth); // Protect all fee routes

// --- FEE STRUCTURES (FeeManagement.tsx) ---

// GET /api/v1/fees/structures
router.get('/structures', async (req, res) => {
  try {
    const structures = await FeeStructure.find().sort({ class: 1, fee_type: 1 });
    res.json(structures);
  } catch (err) {
    console.error('Error fetching fee structures:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/v1/fees/structures
router.post('/structures', async (req, res) => {
  const { class: studentClass, fee_type, amount, academic_year } = req.body;
  
  try {
    const newStructure = new FeeStructure({ 
      class: studentClass, 
      fee_type, 
      amount: Number(amount), 
      academic_year 
    });
    
    const structure = await newStructure.save();
    res.status(201).json(structure);
  } catch (err) {
    console.error('Error creating fee structure:', err);
    res.status(500).json({ message: err.message || 'Server Error' });
  }
});

// PUT /api/v1/fees/structures/:id
router.put('/structures/:id', async (req, res) => {
  const structureFields = req.body;
  
  try {
    // Try to find by custom 'id' field first
    let structure = await FeeStructure.findOne({ id: req.params.id });
    
    if (!structure) {
      // If not found by custom id, try MongoDB _id
      structure = await FeeStructure.findById(req.params.id);
    }

    if (!structure) {
      return res.status(404).json({ message: 'Fee structure not found' });
    }

    // Update the structure
    Object.assign(structure, structureFields);
    await structure.save();

    res.json(structure);
  } catch (err) {
    console.error('Error updating fee structure:', err);
    res.status(500).json({ message: err.message || 'Server Error' });
  }
});

// DELETE /api/v1/fees/structures/:id
router.delete('/structures/:id', async (req, res) => {
  try {
    // Try to find by custom 'id' field first
    let result = await FeeStructure.findOneAndDelete({ id: req.params.id });
    
    if (!result) {
      // If not found by custom id, try MongoDB _id
      result = await FeeStructure.findByIdAndDelete(req.params.id);
    }

    if (!result) {
      return res.status(404).json({ message: 'Fee structure not found' });
    }

    res.json({ message: 'Fee structure removed', id: req.params.id });
  } catch (err) {
    console.error('Error deleting fee structure:', err);
    res.status(500).json({ message: err.message || 'Server Error' });
  }
});

// --- FEE PAYMENTS (Billing.tsx) ---

// GET /api/v1/fees/payments - Fetch all payments, manually join student data
router.get('/payments', async (req, res) => {
  try {
    const payments = await FeePayment.find().sort({ created_at: -1 });
    const Student = require('../models/Student');
    
    // Manually populate student data since we're using custom 'id' field
    const formattedPayments = await Promise.all(
      payments.map(async (payment) => {
        const paymentObj = payment.toObject();
        
        // Find student by custom 'id' field
        const student = await Student.findOne({ id: payment.student_id });
        
        // Add student data in the format expected by frontend
        paymentObj.students = student ? {
          full_name: student.full_name,
          class: student.class,
          section: student.section
        } : null;
        
        return paymentObj;
      })
    );

    res.json(formattedPayments);
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/v1/fees/payments
router.post('/payments', async (req, res) => {
  const { student_id, amount, payment_method, fee_type, academic_year, receipt_number, class: studentClass } = req.body;
  
  try {
    const newPayment = new FeePayment({ 
      student_id, 
      amount: Number(amount), 
      payment_method, 
      fee_type, 
      academic_year, 
      receipt_number, 
      class: studentClass,
      created_by: req.user.id
    });
    
    const payment = await newPayment.save();
    res.status(201).json(payment);
  } catch (err) {
    console.error('Error creating payment:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Receipt number already exists' });
    }
    res.status(500).json({ message: err.message || 'Server Error' });
  }
});

// PUT /api/v1/fees/payments/:id
router.put('/payments/:id', async (req, res) => {
  const paymentFields = req.body;
  
  try {
    // Try to find by custom 'id' field first
    let payment = await FeePayment.findOne({ id: req.params.id });
    
    if (!payment) {
      // If not found by custom id, try MongoDB _id
      payment = await FeePayment.findById(req.params.id);
    }

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Update the payment
    Object.assign(payment, paymentFields);
    await payment.save();

    res.json(payment);
  } catch (err) {
    console.error('Error updating payment:', err);
    res.status(500).json({ message: err.message || 'Server Error' });
  }
});

// DELETE /api/v1/fees/payments/:id
router.delete('/payments/:id', async (req, res) => {
  try {
    // Try to find by custom 'id' field first
    let result = await FeePayment.findOneAndDelete({ id: req.params.id });
    
    if (!result) {
      // If not found by custom id, try MongoDB _id
      result = await FeePayment.findByIdAndDelete(req.params.id);
    }

    if (!result) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({ message: 'Payment removed', id: req.params.id });
  } catch (err) {
    console.error('Error deleting payment:', err);
    res.status(500).json({ message: err.message || 'Server Error' });
  }
});

module.exports = router;