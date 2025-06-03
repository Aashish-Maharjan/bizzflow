const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// @route   GET /api/attendance
// @desc    Get attendance records with filters
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const { date, startDate, endDate, employeeId, status } = req.query;
        let query = {};

        // Single date filter
        if (date) {
            const searchDate = new Date(date);
            query.date = {
                $gte: new Date(searchDate.setHours(0, 0, 0)),
                $lt: new Date(searchDate.setHours(23, 59, 59))
            };
        }

        // Date range filter
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(new Date(startDate).setHours(0, 0, 0)),
                $lt: new Date(new Date(endDate).setHours(23, 59, 59))
            };
        }

        // Employee filter
        if (employeeId) {
            query.employeeId = employeeId;
        }

        // Status filter
        if (status) {
            query.status = status;
        }

        const attendance = await Attendance.find(query)
            .populate('employeeId', ['name', 'employeeId', 'department', 'designation'])
            .sort({ date: -1, 'checkIn.time': -1 });

        res.json(attendance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/attendance/today
// @desc    Get today's attendance records
// @access  Private
router.get('/today', auth, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const attendance = await Attendance.find({
            date: {
                $gte: today,
                $lt: tomorrow
            }
        }).populate('employeeId', ['name', 'employeeId', 'department', 'designation']);

        // Get all employees
        const employees = await Employee.find({ status: 'active' });

        // Create attendance records for employees without records
        const attendanceMap = new Map(attendance.map(a => [a.employeeId._id.toString(), a]));
        const missingAttendance = employees.filter(emp => !attendanceMap.has(emp._id.toString()));

        const defaultAttendance = missingAttendance.map(emp => ({
            employeeId: {
                _id: emp._id,
                name: emp.name,
                employeeId: emp.employeeId,
                department: emp.department,
                designation: emp.designation
            },
            date: today,
            status: 'absent'
        }));

        res.json([...attendance, ...defaultAttendance]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/attendance/check-in
// @desc    Record employee check-in
// @access  Private
router.post('/check-in', [
    auth,
    [
        check('employeeId', 'Employee ID is required').not().isEmpty(),
        check('location', 'Location is required').isArray().optional()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { employeeId, location } = req.body;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Check if attendance record exists for today
        let attendance = await Attendance.findOne({
            employeeId,
            date: today
        });

        if (attendance) {
            if (attendance.checkIn.time) {
                return res.status(400).json({ message: 'Already checked in for today' });
            }
        } else {
            attendance = new Attendance({
                employeeId,
                date: today,
                createdBy: req.user.id
            });
        }

        attendance.checkIn = {
            time: now,
            location: location ? {
                type: 'Point',
                coordinates: location
            } : undefined
        };
        attendance.status = 'present';

        await attendance.save();

        const populatedAttendance = await Attendance.findById(attendance._id)
            .populate('employeeId', ['name', 'employeeId', 'department', 'designation']);

        res.json(populatedAttendance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/attendance/check-out
// @desc    Record employee check-out
// @access  Private
router.post('/check-out', [
    auth,
    [
        check('employeeId', 'Employee ID is required').not().isEmpty(),
        check('location', 'Location is required').isArray().optional()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { employeeId, location } = req.body;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Find today's attendance record
        const attendance = await Attendance.findOne({
            employeeId,
            date: today
        });

        if (!attendance) {
            return res.status(404).json({ message: 'No check-in record found for today' });
        }

        if (!attendance.checkIn.time) {
            return res.status(400).json({ message: 'Must check-in before checking out' });
        }

        if (attendance.checkOut.time) {
            return res.status(400).json({ message: 'Already checked out for today' });
        }

        attendance.checkOut = {
            time: now,
            location: location ? {
                type: 'Point',
                coordinates: location
            } : undefined
        };
        attendance.updatedBy = req.user.id;

        await attendance.save();

        const populatedAttendance = await Attendance.findById(attendance._id)
            .populate('employeeId', ['name', 'employeeId', 'department', 'designation']);

        res.json(populatedAttendance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/attendance/:id
// @desc    Update attendance record
// @access  Private
router.put('/:id', [
    auth,
    [
        check('status', 'Status is required').isIn(['present', 'absent', 'half-day', 'late', 'leave']),
        check('leaveType', 'Invalid leave type').isIn(['sick', 'vacation', 'personal', 'unpaid', null]).optional()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const attendance = await Attendance.findById(req.params.id);
        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        // Update fields
        const { status, leaveType, notes } = req.body;
        attendance.status = status;
        if (status === 'leave' && leaveType) {
            attendance.leaveType = leaveType;
        }
        if (notes) {
            attendance.notes = notes;
        }
        attendance.updatedBy = req.user.id;

        await attendance.save();

        const populatedAttendance = await Attendance.findById(attendance._id)
            .populate('employeeId', ['name', 'employeeId', 'department', 'designation']);

        res.json(populatedAttendance);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Attendance record not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/attendance/bulk
// @desc    Create/Update bulk attendance records
// @access  Private
router.post('/bulk', [
    auth,
    [
        check('records', 'Records are required').isArray(),
        check('records.*.employeeId', 'Employee ID is required').not().isEmpty(),
        check('records.*.status', 'Status is required').isIn(['present', 'absent', 'half-day', 'late', 'leave'])
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { records, date } = req.body;
        const attendanceDate = date ? new Date(date) : new Date();
        attendanceDate.setHours(0, 0, 0, 0);

        const bulkOps = records.map(record => ({
            updateOne: {
                filter: {
                    employeeId: record.employeeId,
                    date: attendanceDate
                },
                update: {
                    $set: {
                        status: record.status,
                        leaveType: record.leaveType,
                        notes: record.notes,
                        updatedBy: req.user.id
                    },
                    $setOnInsert: {
                        date: attendanceDate,
                        createdBy: req.user.id
                    }
                },
                upsert: true
            }
        }));

        await Attendance.bulkWrite(bulkOps);

        const updatedRecords = await Attendance.find({
            date: attendanceDate,
            employeeId: { $in: records.map(r => r.employeeId) }
        }).populate('employeeId', ['name', 'employeeId', 'department', 'designation']);

        res.json(updatedRecords);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 