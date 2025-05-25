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
    check('category', 'Category is required').not().isEmpty()
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
      priority,
      attachments
    } = req.body;

    // Check if assigned user exists
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return res.status(404).json({ message: 'Assigned user not found' });
    }

    const task = new Task({
      title,
      description,
      assignedTo,
      assignedBy: req.user.id,
      dueDate,
      category,
      priority: priority || 'medium',
      attachments: attachments || []
    });

    await task.save();

    // Populate user information
    await task.populate('assignedTo', 'name email');
    await task.populate('assignedBy', 'name email');

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
      search
    } = req.query;

    // Build query
    const query = {};

    // Only show tasks assigned to user or created by user unless admin/manager
    const user = await User.findById(req.user.id);
    if (user.role === 'employee') {
      query.$or = [
        { assignedTo: req.user.id },
        { assignedBy: req.user.id }
      ];
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

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
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('comments.author', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
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
    if (user.role !== 'admin' && 
        task.assignedBy.toString() !== req.user.id && 
        task.assignedTo.toString() !== req.user.id) {
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

// @route   PUT api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', [
  auth,
  [
    check('title', 'Title is required').optional().not().isEmpty(),
    check('description', 'Description is required').optional().not().isEmpty(),
    check('status', 'Invalid status').optional().isIn(['pending', 'in-progress', 'completed', 'cancelled']),
    check('priority', 'Invalid priority').optional().isIn(['low', 'medium', 'high'])
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check user permission
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin' && 
        task.assignedBy.toString() !== req.user.id && 
        task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    // Update fields
    const updateFields = {};
    for (const [key, value] of Object.entries(req.body)) {
      if (value != null) {
        updateFields[key] = value;
      }
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    )
    .populate('assignedTo', 'name email')
    .populate('assignedBy', 'name email');

    res.json(task);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router; 