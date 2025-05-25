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

// @route   POST api/payroll
// @desc    Create a new payroll entry
// @access  Private
router.post('/', [
  auth,
  [
    check('employee', 'Employee is required').not().isEmpty(),
    check('basicSalary', 'Basic salary is required').isNumeric(),
    check('month', 'Month is required').not().isEmpty(),
    check('year', 'Year is required').isNumeric()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      employee,
      basicSalary,
      month,
      year,
      allowances,
      deductions,
      bonus,
      remarks
    } = req.body;

    // Check if employee exists
    const employeeExists = await User.findById(employee);
    if (!employeeExists) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if payroll for this month already exists
    const existingPayroll = await Payroll.findOne({
      employee,
      month,
      year
    });

    if (existingPayroll) {
      return res.status(400).json({ message: 'Payroll for this month already exists' });
    }

    const payroll = new Payroll({
      employee,
      basicSalary,
      month,
      year,
      allowances,
      deductions,
      bonus,
      remarks
    });

    await payroll.save();
    await payroll.populate('employee', 'name email department');

    res.json(payroll);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/payroll
// @desc    Get all payroll entries with filters
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { month, year, employee, status } = req.query;
    const query = {};

    if (month) query.month = month;
    if (year) query.year = year;
    if (employee) query.employee = employee;
    if (status) query.status = status;

    const payrolls = await Payroll.find(query)
      .populate('employee', 'name email department')
      .sort({ createdAt: -1 });

    res.json(payrolls);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
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