// routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const auth = require('../middleware/authMiddleware');

// Protect all student routes
router.use(auth);

// GET /api/v1/students - Fetch all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().sort({ created_at: -1 });
    res.json(students);
  } catch (err) {
    console.error('Error fetching students:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/v1/students - Add new student
router.post('/', async (req, res) => {
  const { 
    student_id, 
    full_name, 
    class: student_class, 
    section, 
    parent_name, 
    parent_contact, 
    admission_date 
  } = req.body;

  try {
    // Check if student_id already exists
    const existingStudent = await Student.findOne({ student_id });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student ID already exists' });
    }

    const newStudent = new Student({
      student_id,
      full_name,
      class: student_class,
      section,
      parent_name,
      parent_contact,
      admission_date: admission_date || new Date()
    });

    const student = await newStudent.save();
    res.status(201).json(student);
  } catch (err) {
    console.error('Error creating student:', err.message);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Student ID already exists' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

// PUT /api/v1/students/:id - Update student (using custom id field)
router.put('/:id', async (req, res) => {
  const updatedFields = req.body;

  try {
    // Use custom 'id' field instead of '_id'
    const student = await Student.findOneAndUpdate(
      { id: req.params.id },
      { $set: updatedFields },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (err) {
    console.error('Error updating student:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// DELETE /api/v1/students/:id - Delete student (using custom id field)
router.delete('/:id', async (req, res) => {
  try {
    // Use custom 'id' field instead of '_id'
    const result = await Student.findOneAndDelete({ id: req.params.id });

    if (!result) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student removed', id: req.params.id });
  } catch (err) {
    console.error('Error deleting student:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;