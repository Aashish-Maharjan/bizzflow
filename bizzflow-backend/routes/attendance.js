const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @route   POST api/attendance/check-in
// @desc    Record attendance check-in
// @access  Private
router.post('/check-in', auth, async (req, res) => {
  try {
    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingAttendance = await Attendance.findOne({
      user: req.user.id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (existingAttendance && existingAttendance.checkIn) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const { coordinates } = req.body;

    const attendance = existingAttendance || new Attendance({
      user: req.user.id,
      date: new Date(),
      checkIn: {
        time: new Date(),
        location: {
          type: 'Point',
          coordinates
        }
      }
    });

    await attendance.save();
    res.json(attendance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/attendance/check-out
// @desc    Record attendance check-out
// @access  Private
router.post('/check-out', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendance = await Attendance.findOne({
      user: req.user.id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ message: 'No check-in found for today' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    const { coordinates } = req.body;
    attendance.checkOut = {
      time: new Date(),
      location: {
        type: 'Point',
        coordinates
      }
    };

    await attendance.save();
    res.json(attendance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/attendance/me
// @desc    Get current user's attendance history
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const attendance = await Attendance.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(30);
    res.json(attendance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/attendance/report
// @desc    Get attendance report (admin/manager only)
// @access  Private
router.get('/report', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!['admin', 'manager'].includes(user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { startDate, endDate, department } = req.query;
    const query = {};
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (department && user.role === 'manager') {
      const departmentUsers = await User.find({ department }).select('_id');
      query.user = { $in: departmentUsers.map(u => u._id) };
    }

    const attendance = await Attendance.find(query)
      .populate('user', 'name email department')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 