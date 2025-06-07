const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const mongoose = require('mongoose');

// @route   GET /api/attendance
// @desc    Get attendance records with filters
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const { date, startDate, endDate, employeeId, status } = req.query;
        
        // Get all employees
        const employees = await User.find({ role: { $ne: 'admin' } })
            .select('name email department role');

        let query = {};

        // Single date filter
        if (date) {
            const searchDate = new Date(date);
            searchDate.setHours(0, 0, 0, 0);
            const nextDate = new Date(searchDate);
            nextDate.setDate(nextDate.getDate() + 1);
            
            query.date = {
                $gte: searchDate,
                $lt: nextDate
            };
        }

        // Date range filter
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
                $lt: new Date(new Date(endDate).setHours(23, 59, 59, 999))
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

        // Get existing attendance records
        const existingAttendance = await Attendance.find(query)
            .populate('employeeId', ['name', 'email', 'department', 'role'])
            .sort({ date: -1, 'checkIn.time': -1 });

        if (date || (startDate && endDate)) {
            // Create a map of existing attendance records
            const attendanceMap = new Map(
                existingAttendance.map(record => [record.employeeId._id.toString(), record])
            );

            // Create default records for employees without attendance
            const defaultRecords = await Promise.all(employees.map(async employee => {
                const existing = attendanceMap.get(employee._id.toString());
                if (existing) return existing;

                // Create a new attendance record with proper fields
                const newAttendance = new Attendance({
                    employeeId: employee._id,
                    date: date ? new Date(date) : new Date(startDate),
                    status: 'absent',
                    workHours: 0,
                    createdBy: req.user.id,
                    updatedBy: req.user.id
                });

                // Save the new attendance record
                await newAttendance.save();

                // Return a populated version of the record
                return {
                    ...newAttendance.toObject(),
                    employeeId: {
                        _id: employee._id,
                        name: employee.name,
                        email: employee.email,
                        department: employee.department,
                        role: employee.role
                    }
                };
            }));

            return res.json(defaultRecords);
        }

        res.json(existingAttendance);
    } catch (err) {
        console.error('Error in fetching attendance:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// @route   GET /api/attendance/today
// @desc    Get today's attendance records
// @access  Private
router.get('/today', auth, async (req, res) => {
    try {
        // Get all employees first
        const employees = await User.find({ role: { $ne: 'admin' } })
            .select('name email department role');

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get existing attendance records
        const existingAttendance = await Attendance.find({
            date: {
                $gte: today,
                $lt: tomorrow
            }
        }).populate('employeeId', ['name', 'email', 'department', 'role']);

        // Create a map of existing attendance records
        const attendanceMap = new Map(
            existingAttendance.map(record => [record.employeeId._id.toString(), record])
        );

        // Create default records for employees without attendance
        const defaultRecords = employees.map(employee => {
            const existing = attendanceMap.get(employee._id.toString());
            if (existing) return existing;

            // Create a new attendance record with proper fields
            const newAttendance = new Attendance({
                employeeId: employee._id,
                date: today,
                status: 'absent',
                workHours: 0,
                createdBy: req.user.id,
                updatedBy: req.user.id
            });

            // Save the new attendance record
            newAttendance.save().catch(err => {
                console.error('Error saving attendance record:', err);
            });

            // Return a formatted response that matches the structure of existing records
            return {
                _id: newAttendance._id,
                employeeId: {
                    _id: employee._id,
                    name: employee.name,
                    email: employee.email,
                    department: employee.department,
                    role: employee.role
                },
                date: today,
                status: 'absent',
                workHours: 0,
                createdBy: req.user.id,
                updatedBy: req.user.id
            };
        });

        res.json(defaultRecords);
    } catch (err) {
        console.error('Error in fetching today\'s attendance:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// @route   POST /api/attendance/check-in
// @desc    Record employee check-in
// @access  Private
router.post('/check-in', auth, async (req, res) => {
    try {
        const { employeeId, time, location } = req.body;
        const checkInTime = time ? new Date(time) : new Date();
        const today = new Date(checkInTime);
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Find existing attendance record
        let attendance = await Attendance.findOne({
            employeeId,
            date: {
                $gte: today,
                $lt: tomorrow
            }
        });

        if (!attendance) {
            // Create new attendance record
            attendance = new Attendance({
                employeeId,
                date: today,
                status: 'present',
                createdBy: req.user.id
            });
        }

        // Update check-in details
        attendance.checkIn = {
            time: checkInTime,
            location: location ? {
                type: 'Point',
                coordinates: location
            } : undefined
        };

        // Update status if needed
        if (attendance.status === 'absent') {
            attendance.status = 'present';
        }

        // Calculate work hours if check-out exists
        if (attendance.checkOut?.time) {
            const hours = (attendance.checkOut.time - checkInTime) / (1000 * 60 * 60);
            attendance.workHours = Math.max(0, Math.round(hours * 100) / 100);
        }

        attendance.updatedBy = req.user.id;
        await attendance.save();

        res.json(attendance);
    } catch (err) {
        console.error('Error in check-in:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// @route   POST /api/attendance/check-out
// @desc    Record employee check-out
// @access  Private
router.post('/check-out', auth, async (req, res) => {
    try {
        const { employeeId, time, location } = req.body;
        const checkOutTime = time ? new Date(time) : new Date();
        const today = new Date(checkOutTime);
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Find existing attendance record
        let attendance = await Attendance.findOne({
            employeeId,
            date: {
                $gte: today,
                $lt: tomorrow
            }
        });

        if (!attendance) {
            return res.status(400).json({ message: 'No check-in record found for today' });
        }

        // Update check-out details
        attendance.checkOut = {
            time: checkOutTime,
            location: location ? {
                type: 'Point',
                coordinates: location
            } : undefined
        };

        // Calculate work hours
        if (attendance.checkIn?.time) {
            const hours = (checkOutTime - attendance.checkIn.time) / (1000 * 60 * 60);
            attendance.workHours = Math.max(0, Math.round(hours * 100) / 100);
        }

        attendance.updatedBy = req.user.id;
        await attendance.save();

        res.json(attendance);
    } catch (err) {
        console.error('Error in check-out:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// @route   PUT /api/attendance/:id
// @desc    Update attendance record
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        const { status, leaveType, notes } = req.body;
        const attendance = await Attendance.findById(req.params.id);

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        if (status) attendance.status = status;
        if (leaveType) attendance.leaveType = leaveType;
        if (notes) attendance.notes = notes;

        attendance.updatedBy = req.user.id;
        await attendance.save();

        res.json(attendance);
    } catch (err) {
        console.error('Error in updating attendance:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// @route   POST /api/attendance/bulk
// @desc    Bulk update attendance records
// @access  Private
router.post('/bulk', auth, async (req, res) => {
    try {
        const { records, date } = req.body;
        const bulkDate = date ? new Date(date) : new Date();
        bulkDate.setHours(0, 0, 0, 0);
        const nextDate = new Date(bulkDate);
        nextDate.setDate(nextDate.getDate() + 1);

        const operations = records.map(async (record) => {
            const { employeeId, status, leaveType, notes } = record;

            // Find or create attendance record
            let attendance = await Attendance.findOne({
                employeeId,
                date: {
                    $gte: bulkDate,
                    $lt: nextDate
                }
            });

            if (!attendance) {
                attendance = new Attendance({
                    employeeId,
                    date: bulkDate,
                    status: status || 'absent',
                    workHours: 0,
                    createdBy: req.user.id,
                    updatedBy: req.user.id
                });
            } else {
                attendance.status = status;
                attendance.updatedBy = req.user.id;
            }

            if (leaveType) attendance.leaveType = leaveType;
            if (notes) attendance.notes = notes;

            return attendance.save();
        });

        const results = await Promise.all(operations);
        
        // Populate employee details for the response
        const populatedResults = await Attendance.populate(results, {
            path: 'employeeId',
            select: 'name email department role'
        });

        res.json(populatedResults);
    } catch (err) {
        console.error('Error in bulk update:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

module.exports = router; 