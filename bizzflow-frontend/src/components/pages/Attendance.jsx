import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiClock, FiLogOut, FiCheck, FiX, FiCalendar } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const Attendance = () => {
    const [employees, setEmployees] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [bulkEdit, setBulkEdit] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('present');

    useEffect(() => {
        fetchEmployees();
        fetchTodayAttendance();
    }, []);

    useEffect(() => {
        if (selectedDate) {
            fetchAttendance(selectedDate);
        }
    }, [selectedDate]);

    const fetchEmployees = async () => {
        try {
            const response = await axios.get('/api/payroll/employees');
            setEmployees(response.data);
        } catch (error) {
            toast.error('Failed to fetch employees');
        }
    };

    const fetchTodayAttendance = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/attendance/today');
            setAttendance(response.data);
        } catch (error) {
            toast.error('Failed to fetch attendance');
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendance = async (date) => {
        try {
            setLoading(true);
            const response = await axios.get('/api/attendance', {
                params: {
                    date: date.toISOString()
                }
            });
            setAttendance(response.data);
        } catch (error) {
            toast.error('Failed to fetch attendance');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (employeeId) => {
        try {
            setLoading(true);
            const position = await getCurrentPosition();
            await axios.post('/api/attendance/check-in', {
                employeeId,
                location: position ? [position.coords.longitude, position.coords.latitude] : undefined
            });
            toast.success('Check-in recorded successfully');
            fetchTodayAttendance();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to record check-in');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async (employeeId) => {
        try {
            setLoading(true);
            const position = await getCurrentPosition();
            await axios.post('/api/attendance/check-out', {
                employeeId,
                location: position ? [position.coords.longitude, position.coords.latitude] : undefined
            });
            toast.success('Check-out recorded successfully');
            fetchTodayAttendance();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to record check-out');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (attendanceId, status, leaveType = null) => {
        try {
            setLoading(true);
            await axios.put(`/api/attendance/${attendanceId}`, {
                status,
                leaveType,
                notes: `Status updated to ${status}`
            });
            toast.success('Attendance status updated');
            fetchAttendance(selectedDate);
        } catch (error) {
            toast.error('Failed to update attendance status');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkUpdate = async () => {
        try {
            setLoading(true);
            const records = attendance.map(record => ({
                employeeId: record.employeeId._id,
                status: selectedStatus
            }));

            await axios.post('/api/attendance/bulk', {
                records,
                date: selectedDate
            });

            toast.success('Attendance updated successfully');
            fetchAttendance(selectedDate);
            setBulkEdit(false);
        } catch (error) {
            toast.error('Failed to update attendance');
        } finally {
            setLoading(false);
        }
    };

    const getCurrentPosition = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                resolve(null);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                position => resolve(position),
                error => resolve(null)
            );
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'present':
                return 'bg-green-100 text-green-800';
            case 'absent':
                return 'bg-red-100 text-red-800';
            case 'late':
                return 'bg-yellow-100 text-yellow-800';
            case 'half-day':
                return 'bg-orange-100 text-orange-800';
            case 'leave':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Attendance Management</h1>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <DatePicker
                                selected={selectedDate}
                                onChange={date => setSelectedDate(date)}
                                dateFormat="MMMM d, yyyy"
                                className="block w-40 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            <FiCalendar className="ml-2 text-gray-400" />
                        </div>
                        {!bulkEdit ? (
                            <button
                                onClick={() => setBulkEdit(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                Bulk Update
                            </button>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="block w-32 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    <option value="present">Present</option>
                                    <option value="absent">Absent</option>
                                    <option value="late">Late</option>
                                    <option value="half-day">Half Day</option>
                                    <option value="leave">Leave</option>
                                </select>
                                <button
                                    onClick={handleBulkUpdate}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                                >
                                    <FiCheck className="mr-2" /> Apply
                                </button>
                                <button
                                    onClick={() => setBulkEdit(false)}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Attendance Table */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Employee
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Department
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Check In
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Check Out
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Work Hours
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {attendance.map((record) => (
                                <tr key={record.employeeId._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {record.employeeId.name}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {record.employeeId.employeeId}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white">
                                            {record.employeeId.department}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {record.employeeId.designation}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {record.checkIn?.time ? (
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {new Date(record.checkIn.time).toLocaleTimeString()}
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleCheckIn(record.employeeId._id)}
                                                disabled={loading || record.status === 'absent' || record.status === 'leave'}
                                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                                            >
                                                <FiClock className="mr-1" /> Check In
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {record.checkOut?.time ? (
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {new Date(record.checkOut.time).toLocaleTimeString()}
                                            </div>
                                        ) : record.checkIn?.time ? (
                                            <button
                                                onClick={() => handleCheckOut(record.employeeId._id)}
                                                disabled={loading}
                                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                                            >
                                                <FiLogOut className="mr-1" /> Check Out
                                            </button>
                                        ) : null}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white">
                                            {record.workHours > 0 ? `${record.workHours.toFixed(2)} hrs` : '-'}
                                        </div>
                                        {record.overtime > 0 && (
                                            <div className="text-xs text-green-600">
                                                +{record.overtime.toFixed(2)} hrs OT
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                                            {record.status}
                                        </span>
                                        {record.leaveType && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {record.leaveType} leave
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {!bulkEdit && (
                                            <div className="flex items-center space-x-2">
                                                <select
                                                    value={record.status}
                                                    onChange={(e) => handleStatusChange(record._id, e.target.value)}
                                                    disabled={loading}
                                                    className="block w-24 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-1 px-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                >
                                                    <option value="present">Present</option>
                                                    <option value="absent">Absent</option>
                                                    <option value="late">Late</option>
                                                    <option value="half-day">Half Day</option>
                                                    <option value="leave">Leave</option>
                                                </select>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Attendance; 