const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Payroll = require('../models/Payroll');
const User = require('../models/User');
const Task = require('../models/Task');
const Attendance = require('../models/Attendance');
const mongoose = require('mongoose');
const Employee = require('../models/Employee');

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
    check('year', 'Year is required').isNumeric(),
    check('allowances', 'Allowances must be a number').optional().isNumeric(),
    check('deductions', 'Deductions must be a number').optional().isNumeric(),
    check('bonus', 'Bonus must be a number').optional().isNumeric()
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    console.log('Received payroll request:', req.body);

    const {
      employee,
      basicSalary,
      month,
      year,
      allowances = 0,
      deductions = 0,
      bonus = 0
    } = req.body;

    // Convert month to lowercase for consistent comparison
    const normalizedMonth = month.toLowerCase();

    // Check if employee exists
    const employeeExists = await User.findById(employee);
    if (!employeeExists) {
      console.log('Employee not found:', employee);
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if payroll already exists for this month and year
    const existingPayroll = await Payroll.findOne({
      employee,
      month: normalizedMonth,
      year: Number(year)
    });

    if (existingPayroll) {
      console.log('Existing payroll found:', {
        employee: existingPayroll.employee,
        month: existingPayroll.month,
        year: existingPayroll.year
      });
      return res.status(400).json({ 
        message: `Payroll already exists for ${employeeExists.name} for ${month} ${year}` 
      });
    }

    // Create new payroll
    const payroll = new Payroll({
      employee,
      basicSalary: Number(basicSalary),
      month: normalizedMonth,
      year: Number(year),
      allowances: Number(allowances),
      deductions: Number(deductions),
      bonus: Number(bonus),
      netSalary: Number(basicSalary) + Number(allowances) + Number(bonus) - Number(deductions),
      status: 'pending',
      generatedBy: req.user.id
    });

    await payroll.save();

    // Create initial attendance record for the employee
    const today = new Date();
    const attendance = new Attendance({
      user: employee,
      date: today,
      status: 'present',
      notes: 'Initial attendance record'
    });

    await attendance.save();

    // Create initial onboarding task for the employee
    const task = new Task({
      title: 'Complete Onboarding Process',
      description: 'Complete all onboarding tasks and documentation',
      assignedTo: employee,
      assignedBy: req.user.id,
      department: employeeExists.department,
      dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      priority: 'high',
      category: 'Onboarding',
      status: 'pending'
    });

    await task.save();

    // Populate employee details
    const populatedPayroll = await Payroll.findById(payroll._id)
      .populate('employee', ['name', 'email', 'department'])
      .populate('generatedBy', ['name']);

    console.log('Sending response:', populatedPayroll);
    res.json({
      payroll: populatedPayroll,
      attendance,
      task
    });
  } catch (err) {
    console.error('Error in payroll generation:', err);
    console.error('Error stack:', err.stack);
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
    console.log('Received query params:', req.query);
    console.log('User making request:', req.user);
    
    const { month, year, employee } = req.query;
    const query = {};

    // Add filters only if they are provided
    if (month && year) {
      query.month = month.toLowerCase();
      query.year = Number(year);
    } else {
      // If no month/year provided, get current month's payrolls by default
      const currentDate = new Date();
      query.month = currentDate.toLocaleString('default', { month: 'long' }).toLowerCase();
      query.year = currentDate.getFullYear();
    }

    if (employee) {
      query.employee = employee;
    }

    console.log('Constructed query:', query);

    // First check if the User model is accessible
    try {
      const userCount = await mongoose.model('User').countDocuments();
      console.log(`Total users in database: ${userCount}`);
    } catch (userErr) {
      console.error('Error accessing User model:', userErr);
    }

    // First check if we can find any payrolls without population
    const payrollCount = await Payroll.countDocuments(query);
    console.log(`Found ${payrollCount} payroll records before population`);

    // Then try to populate
    const payrolls = await Payroll.find(query)
      .populate({
        path: 'employee',
        select: 'name email department',
        model: 'User'
      })
      .populate({
        path: 'generatedBy',
        select: 'name',
        model: 'User'
      })
      .sort({ createdAt: -1 });

    console.log(`Successfully populated ${payrolls.length} payroll records`);
    
    // Add additional validation
    const validPayrolls = payrolls.filter(p => p.employee && p.generatedBy);
    if (validPayrolls.length !== payrolls.length) {
      console.warn('Some payrolls have missing references:', 
        payrolls.filter(p => !p.employee || !p.generatedBy).map(p => p._id)
      );
    }

    // Log a sample payroll for debugging
    if (validPayrolls.length > 0) {
      console.log('Sample payroll record:', JSON.stringify(validPayrolls[0], null, 2));
    }

    res.json(validPayrolls);
  } catch (err) {
    console.error('Error in fetching payrolls:', {
      message: err.message,
      stack: err.stack,
      query: req.query,
      user: req.user
    });

    // Check if it's a MongoDB connection error
    if (err.name === 'MongooseError' || err.name === 'MongoError') {
      console.error('MongoDB Error Details:', {
        name: err.name,
        code: err.code,
        state: mongoose.connection.readyState
      });
    }

    res.status(500).json({ 
      message: 'Server error in fetching payrolls',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      mongoState: mongoose.connection.readyState
    });
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

// @route   GET /api/payroll/employees
// @desc    Get all employees
// @access  Private
router.get('/employees', auth, async (req, res) => {
    try {
        const { department, status, search } = req.query;
        let query = {};

        // Filter by department
        if (department) {
            query.department = department;
        }

        // Filter by status
        if (status) {
            query.status = status;
        } else {
            // By default, show only active employees
            query.status = 'active';
        }

        // Search by name or employee ID
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { employeeId: { $regex: search, $options: 'i' } }
            ];
        }

        const employees = await Employee.find(query)
            .select('name employeeId email department designation status')
            .sort({ name: 1 });

        res.json(employees);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/payroll/employees
// @desc    Create a new employee
// @access  Private
router.post('/employees', [
    auth,
    [
        check('name', 'Name is required').not().isEmpty(),
        check('employeeId', 'Employee ID is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('department', 'Department is required').not().isEmpty(),
        check('designation', 'Designation is required').not().isEmpty(),
        check('joiningDate', 'Joining date is required').not().isEmpty(),
        check('salary.basic', 'Basic salary is required').isNumeric()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const {
            name,
            employeeId,
            email,
            phone,
            department,
            designation,
            joiningDate,
            salary,
            bankDetails,
            emergencyContact
        } = req.body;

        // Check if employee already exists
        let employee = await Employee.findOne({ 
            $or: [
                { employeeId },
                { email }
            ]
        });

        if (employee) {
            return res.status(400).json({ 
                message: 'Employee already exists with this ID or email' 
            });
        }

        employee = new Employee({
            name,
            employeeId,
            email,
            phone,
            department,
            designation,
            joiningDate,
            salary,
            bankDetails,
            emergencyContact,
            createdBy: req.user.id
        });

        await employee.save();
        res.json(employee);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/payroll/employees/:id
// @desc    Get employee by ID
// @access  Private
router.get('/employees/:id', auth, async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.json(employee);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/payroll/employees/:id
// @desc    Update employee
// @access  Private
router.put('/employees/:id', [
    auth,
    [
        check('name', 'Name is required').not().isEmpty(),
        check('department', 'Department is required').not().isEmpty(),
        check('designation', 'Designation is required').not().isEmpty(),
        check('salary.basic', 'Basic salary is required').isNumeric()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const employee = await Employee.findById(req.params.id);
        
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Update fields
        const updateFields = { ...req.body };
        delete updateFields.employeeId; // Prevent employeeId from being updated
        delete updateFields.email; // Prevent email from being updated
        updateFields.updatedBy = req.user.id;

        const updatedEmployee = await Employee.findByIdAndUpdate(
            req.params.id,
            { $set: updateFields },
            { new: true }
        );

        res.json(updatedEmployee);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/payroll/employees/:id
// @desc    Delete employee (soft delete by setting status to 'terminated')
// @access  Private
router.delete('/employees/:id', auth, async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        employee.status = 'terminated';
        employee.updatedBy = req.user.id;
        await employee.save();

        res.json({ message: 'Employee terminated successfully' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router; 