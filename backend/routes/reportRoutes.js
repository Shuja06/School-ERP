// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Staff = require('../models/Staff');
const FeePayment = require('../models/FeePayment');
const FeeStructure = require('../models/FeeStructure');
const Payroll = require('../models/Payroll');
const Expense = require('../models/Expense');
const auth = require('../middleware/authMiddleware');

router.use(auth); // Protect all report routes

// GET /api/v1/reports/dashboard - Get dashboard summary
router.get('/dashboard', async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalStaff = await Staff.countDocuments();
    
    // Fee collection
    const feePayments = await FeePayment.find();
    const totalRevenue = feePayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    
    // Expenses
    const expenses = await Expense.find();
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    
    // Payroll
    const payrolls = await Payroll.find({ payment_status: 'paid' });
    const totalPayroll = payrolls.reduce((sum, p) => sum + Number(p.net_salary || 0), 0);
    
    // Outstanding dues (estimated based on fee structures vs payments)
    const feeStructures = await FeeStructure.find();
    const expectedRevenue = feeStructures.reduce((sum, fs) => {
      const studentsInClass = totalStudents / 10; // Rough estimate
      return sum + (Number(fs.amount) * studentsInClass);
    }, 0);
    const outstandingDues = Math.max(0, expectedRevenue - totalRevenue);
    
    // Collection rate
    const collectionRate = expectedRevenue > 0 ? ((totalRevenue / expectedRevenue) * 100).toFixed(1) : 0;

    res.json({
      totalStudents,
      totalStaff,
      totalRevenue,
      totalExpenses,
      totalPayroll,
      outstandingDues,
      collectionRate,
      netIncome: totalRevenue - totalExpenses - totalPayroll
    });
  } catch (err) {
    console.error('Error fetching dashboard report:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/v1/reports/fee-collection - Fee collection report
router.get('/fee-collection', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = {};
    if (startDate && endDate) {
      query.payment_date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const payments = await FeePayment.find(query).sort({ payment_date: -1 });
    
    // Group by month
    const monthlyData = payments.reduce((acc, payment) => {
      const month = new Date(payment.payment_date || payment.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + Number(payment.amount);
      return acc;
    }, {});

    // Group by payment method
    const methodData = payments.reduce((acc, payment) => {
      acc[payment.payment_method] = (acc[payment.payment_method] || 0) + Number(payment.amount);
      return acc;
    }, {});

    // Group by fee type
    const feeTypeData = payments.reduce((acc, payment) => {
      acc[payment.fee_type] = (acc[payment.fee_type] || 0) + Number(payment.amount);
      return acc;
    }, {});

    const totalCollection = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    res.json({
      totalCollection,
      totalTransactions: payments.length,
      monthlyBreakdown: monthlyData,
      paymentMethodBreakdown: methodData,
      feeTypeBreakdown: feeTypeData,
      payments
    });
  } catch (err) {
    console.error('Error generating fee collection report:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/v1/reports/outstanding-dues - Outstanding dues report
router.get('/outstanding-dues', async (req, res) => {
  try {
    const students = await Student.find();
    const feeStructures = await FeeStructure.find();
    const payments = await FeePayment.find();

    const studentDues = students.map(student => {
      // Get fee structure for student's class
      const classFees = feeStructures.filter(fs => fs.class === student.class);
      const expectedFee = classFees.reduce((sum, fs) => sum + Number(fs.amount), 0);

      // Get payments by this student
      const studentPayments = payments.filter(p => p.student_id === student.id);
      const paidAmount = studentPayments.reduce((sum, p) => sum + Number(p.amount), 0);

      const dueAmount = Math.max(0, expectedFee - paidAmount);

      return {
        student_id: student.student_id,
        full_name: student.full_name,
        class: student.class,
        expectedFee,
        paidAmount,
        dueAmount,
        status: dueAmount === 0 ? 'Paid' : dueAmount < expectedFee ? 'Partial' : 'Unpaid'
      };
    });

    // Filter only students with dues
    const studentsWithDues = studentDues.filter(s => s.dueAmount > 0);
    const totalDues = studentsWithDues.reduce((sum, s) => sum + s.dueAmount, 0);

    // Group by class
    const classwiseDues = studentsWithDues.reduce((acc, s) => {
      acc[s.class] = (acc[s.class] || 0) + s.dueAmount;
      return acc;
    }, {});

    res.json({
      totalOutstanding: totalDues,
      totalStudentsWithDues: studentsWithDues.length,
      studentsWithDues,
      classwiseBreakdown: classwiseDues
    });
  } catch (err) {
    console.error('Error generating outstanding dues report:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/v1/reports/expenses - Expense report
router.get('/expenses', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = {};
    if (startDate && endDate) {
      query.expense_date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const expenses = await Expense.find(query).sort({ expense_date: -1 });
    
    // Group by category
    const categoryData = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
      return acc;
    }, {});

    // Group by month
    const monthlyData = expenses.reduce((acc, expense) => {
      const month = new Date(expense.expense_date || expense.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + Number(expense.amount);
      return acc;
    }, {});

    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    res.json({
      totalExpenses,
      totalTransactions: expenses.length,
      categoryBreakdown: categoryData,
      monthlyBreakdown: monthlyData,
      expenses
    });
  } catch (err) {
    console.error('Error generating expense report:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/v1/reports/payroll - Payroll report
router.get('/payroll', async (req, res) => {
  try {
    const { month } = req.query;
    
    let query = {};
    if (month) {
      query.month = month;
    }

    const payrolls = await Payroll.find(query);
    
    // Manually populate staff data
    const Staff = require('../models/Staff');
    const formattedPayrolls = await Promise.all(
      payrolls.map(async (payroll) => {
        const staff = await Staff.findOne({ id: payroll.staff_id });
        return {
          ...payroll.toObject(),
          staff: staff ? {
            full_name: staff.full_name,
            designation: staff.designation,
            department: staff.department
          } : null
        };
      })
    );

    // Group by department
    const departmentData = formattedPayrolls.reduce((acc, p) => {
      const dept = p.staff?.department || 'Unknown';
      acc[dept] = (acc[dept] || 0) + Number(p.net_salary);
      return acc;
    }, {});

    // Group by status
    const statusData = formattedPayrolls.reduce((acc, p) => {
      acc[p.payment_status] = (acc[p.payment_status] || 0) + 1;
      return acc;
    }, {});

    const totalPayroll = formattedPayrolls.reduce((sum, p) => sum + Number(p.net_salary), 0);
    const paidPayroll = formattedPayrolls
      .filter(p => p.payment_status === 'paid')
      .reduce((sum, p) => sum + Number(p.net_salary), 0);

    res.json({
      totalPayroll,
      paidPayroll,
      pendingPayroll: totalPayroll - paidPayroll,
      totalStaff: formattedPayrolls.length,
      departmentBreakdown: departmentData,
      statusBreakdown: statusData,
      payrolls: formattedPayrolls
    });
  } catch (err) {
    console.error('Error generating payroll report:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/v1/reports/income-expense - Income vs Expense summary
router.get('/income-expense', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateQuery = {};
    if (startDate && endDate) {
      dateQuery = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Income (Fee payments)
    const payments = await FeePayment.find(
      startDate && endDate ? { payment_date: dateQuery } : {}
    );
    const totalIncome = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Expenses
    const expenses = await Expense.find(
      startDate && endDate ? { expense_date: dateQuery } : {}
    );
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    // Net profit/loss
    const netAmount = totalIncome - totalExpenses;

    // Monthly comparison
    const monthlyData = {};
    
    payments.forEach(p => {
      const month = new Date(p.payment_date || p.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
      monthlyData[month].income += Number(p.amount);
    });

    expenses.forEach(e => {
      const month = new Date(e.expense_date || e.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
      monthlyData[month].expense += Number(e.amount);
    });

    res.json({
      totalIncome,
      totalExpenses,
      netAmount,
      profitMargin: totalIncome > 0 ? ((netAmount / totalIncome) * 100).toFixed(2) : 0,
      monthlyComparison: monthlyData
    });
  } catch (err) {
    console.error('Error generating income-expense report:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;