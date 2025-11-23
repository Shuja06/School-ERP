// routes/expenseRoutes.js
const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const auth = require('../middleware/authMiddleware');

router.use(auth);

// GET /api/v1/expenses
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ expense_date: -1 });
    res.json(expenses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST /api/v1/expenses
router.post('/', async (req, res) => {
  const { category, description, amount, payment_method, receipt_number } = req.body;
  try {
    const newExpense = new Expense({
      category, description, amount, payment_method, receipt_number,
      created_by: req.user.id
    });
    const expense = await newExpense.save();
    res.status(201).json(expense);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PUT /api/v1/expenses/:id
router.put('/:id', async (req, res) => {
  const expenseFields = req.body;
  try {
    const expense = await Expense.findOneAndUpdate(
      { id: req.params.id },
      { $set: expenseFields },
      { new: true }
    );
    if (!expense) return res.status(404).json({ msg: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// DELETE /api/v1/expenses/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await Expense.findOneAndDelete({ id: req.params.id });
    if (!result) return res.status(404).json({ msg: 'Expense not found' });
    res.json({ msg: 'Expense removed', id: req.params.id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;