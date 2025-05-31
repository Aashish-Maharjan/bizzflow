const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const User = require('../models/User');

// @route   POST api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', [
  auth,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('assignedTo', 'AssignedTo is required').not().isEmpty(),
    check('dueDate', 'Due date is required').not().isEmpty(),
    check('category', 'Category is required').not().isEmpty(),
    check('department', 'Department is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      title,
      description,
      assignedTo,
      dueDate,
      category,
      department,
      priority,
      attachments
    } = req.body;

    // Check if assigned user exists and is from the same department
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return res.status(404).json({ message: 'Assigned user not found' });
    }

    // Get the assigning user (current user)
    const assigningUser = await User.findById(req.user.id);
    
    // Check department permissions
    if (assigningUser.role !== 'admin' && assigningUser.department !== assignedUser.department) {
      return res.status(403).json({ message: 'Cannot assign tasks to users from different departments' });
    }

    const task = new Task({
      title,
      description,
      assignedTo,
      assignedBy: req.user.id,
      department,
      dueDate,
      category,
      priority: priority || 'medium',
      attachments: attachments || []
    });

    // Add to history
    task.history.push({
      user: req.user.id,
      action: 'created',
      newValue: {
        title,
        description,
        assignedTo,
        dueDate,
        category,
        priority
      }
    });

    await task.save();

    // Populate user information
    await task.populate([
      { path: 'assignedTo', select: 'name email department' },
      { path: 'assignedBy', select: 'name email department' }
    ]);

    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/tasks
// @desc    Get all tasks (with filters)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      status,
      priority,
      category,
      assignedTo,
      department,
      search,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    // Get the current user
    const user = await User.findById(req.user.id);

    // Department-based filtering
    if (user.role === 'employee') {
      // Employees can only see tasks assigned to them or created by them
      query.$or = [
        { assignedTo: req.user.id },
        { assignedBy: req.user.id }
      ];
    } else if (user.role === 'manager') {
      // Managers can see all tasks in their department
      query.department = user.department;
    }
    // Admins can see all tasks

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (assignedTo) query.assignedTo = assignedTo;
    if (department && user.role === 'admin') query.department = department;
    
    // Date range filter
    if (startDate || endDate) {
      query.dueDate = {};
      if (startDate) query.dueDate.$gte = new Date(startDate);
      if (endDate) query.dueDate.$lte = new Date(endDate);
    }

    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email department')
      .populate('assignedBy', 'name email department')
      .populate('comments.user', 'name email')
      .populate('history.user', 'name email')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 });

    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/tasks/:id
// @desc    Get task by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email department')
      .populate('assignedBy', 'name email department')
      .populate('comments.user', 'name email')
      .populate('history.user', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has permission to view this task
    const user = await User.findById(req.user.id);
    if (user.role === 'employee' && 
        task.assignedTo._id.toString() !== req.user.id && 
        task.assignedBy._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this task' });
    }

    if (user.role === 'manager' && task.department !== user.department) {
      return res.status(403).json({ message: 'Not authorized to view this task' });
    }

    res.json(task);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check user permission
    const user = await User.findById(req.user.id);
    if (user.role === 'employee' && 
        task.assignedTo.toString() !== req.user.id && 
        task.assignedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    if (user.role === 'manager' && task.department !== user.department) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    // Track changes for history
    const changes = {};
    for (const [key, value] of Object.entries(req.body)) {
      if (task[key] !== value) {
        changes[key] = {
          old: task[key],
          new: value
        };
      }
    }

    // Update task
    Object.assign(task, req.body);

    // Add to history if there were changes
    if (Object.keys(changes).length > 0) {
      task.history.push({
        user: req.user.id,
        action: 'updated',
        oldValue: Object.fromEntries(Object.entries(changes).map(([k, v]) => [k, v.old])),
        newValue: Object.fromEntries(Object.entries(changes).map(([k, v]) => [k, v.new]))
      });
    }

    await task.save();
    
    // Populate user information
    await task.populate([
      { path: 'assignedTo', select: 'name email department' },
      { path: 'assignedBy', select: 'name email department' },
      { path: 'comments.user', select: 'name email' },
      { path: 'history.user', select: 'name email' }
    ]);

    res.json(task);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/tasks/:id/comments
// @desc    Add a comment to a task
// @access  Private
router.post('/:id/comments', [
  auth,
  [check('text', 'Comment text is required').not().isEmpty()]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check user permission
    const user = await User.findById(req.user.id);
    if (user.role === 'employee' && 
        task.assignedTo.toString() !== req.user.id && 
        task.assignedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to comment on this task' });
    }

    if (user.role === 'manager' && task.department !== user.department) {
      return res.status(403).json({ message: 'Not authorized to comment on this task' });
    }

    task.comments.push({
      user: req.user.id,
      text: req.body.text
    });

    await task.save();
    
    // Populate user information
    await task.populate([
      { path: 'assignedTo', select: 'name email department' },
      { path: 'assignedBy', select: 'name email department' },
      { path: 'comments.user', select: 'name email' },
      { path: 'history.user', select: 'name email' }
    ]);

    res.json(task);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check user permission
    const user = await User.findById(req.user.id);
    if (user.role === 'employee' && 
        task.assignedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    if (user.role === 'manager' && task.department !== user.department) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router; 