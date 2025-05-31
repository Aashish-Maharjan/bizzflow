const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Payroll = require('../models/Payroll');
const User = require('../models/User');

// @route   GET api/payroll/employees
// @desc    Get all employees for payroll
// @access  Private
router.get('/employees', auth, async (req, res) => {
  try {
    const users = await User.find()
      .select('name email department role basicSalary')
      .sort({ name: 1 });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/payroll
// @desc    Generate payroll for an employee
// @access  Private
router.post('/', [
  auth,
  [
    check('employee', 'Employee ID is required').not().isEmpty(),
    check('basicSalary', 'Basic salary is required').isNumeric(),
    check('month', 'Month is required').not().isEmpty(),
    check('year', 'Year is required').isNumeric()
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    console.log('Received payroll data:', req.body); // Debug log

    const {
      employee,
      basicSalary,
      month,
      year,
      allowances,
      deductions,
      bonus
    } = req.body;

    // Check if employee exists
    const employeeExists = await User.findById(employee);
    if (!employeeExists) {
      console.log('Employee not found:', employee); // Debug log
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if payroll already exists for this month and year
    const existingPayroll = await Payroll.findOne({
      employee,
      month,
      year
    });

    if (existingPayroll) {
      console.log('Existing payroll found:', existingPayroll); // Debug log
      return res.status(400).json({ message: 'Payroll already generated for this month' });
    }

    // Calculate net salary
    const netSalary = Number(basicSalary) + Number(allowances || 0) + Number(bonus || 0) - Number(deductions || 0);
    console.log('Calculated net salary:', netSalary); // Debug log

    // Create new payroll
    const payroll = new Payroll({
      employee,
      basicSalary: Number(basicSalary),
      month,
      year,
      allowances: Number(allowances || 0),
      deductions: Number(deductions || 0),
      bonus: Number(bonus || 0),
      netSalary,
      status: 'pending',
      generatedBy: req.user.id
    });

    console.log('Created payroll object:', payroll); // Debug log

    await payroll.save();

    // Populate employee details
    const populatedPayroll = await Payroll.findById(payroll._id)
      .populate('employee', ['name', 'email', 'department'])
      .populate('generatedBy', ['name']);

    console.log('Populated payroll:', populatedPayroll); // Debug log
    res.json(populatedPayroll);
  } catch (err) {
    console.error('Error in payroll generation:', err);
    console.error('Error stack:', err.stack); // Debug log
    res.status(500).json({ 
      message: 'Server error in payroll generation',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// @route   GET /api/payroll
// @desc    Get payrolls with filters
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = {};
    
    if (month) query.month = month;
    if (year) query.year = year;

    const payrolls = await Payroll.find(query)
      .populate('employee', ['name', 'email', 'department'])
      .populate('generatedBy', ['name'])
      .sort({ createdAt: -1 });

    res.json(payrolls);
  } catch (err) {
    console.error('Error fetching payrolls:', err);
    res.status(500).json({ message: 'Server error in fetching payrolls' });
  }
});

// @route   PUT api/payroll/:id
// @desc    Update payroll status
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, paidDate } = req.body;
    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }

    if (status) {
      payroll.status = status;
      if (status === 'paid') {
        payroll.paidDate = paidDate || new Date();
      }
    }

    await payroll.save();
    await payroll.populate('employee', 'name email department');

    res.json(payroll);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/payroll/:id
// @desc    Delete a payroll entry
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }

    await payroll.deleteOne();
    res.json({ message: 'Payroll removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 