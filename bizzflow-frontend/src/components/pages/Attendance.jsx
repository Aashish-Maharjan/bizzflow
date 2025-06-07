import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiClock, FiLogOut, FiCheck, FiX, FiCalendar, FiSearch, FiFilter } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import Card from "../ui/Card";

const Attendance = () => {
    const [employees, setEmployees] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [bulkEdit, setBulkEdit] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('present');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [actionType, setActionType] = useState(null); // 'check-in' or 'check-out'

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
            // First, get all employees
            const employeesResponse = await axios.get('/api/payroll/employees');
            setEmployees(employeesResponse.data);

            // Then, get today's attendance records
            const response = await axios.get('/api/attendance/today');
            let attendanceRecords = response.data;

            // Create default attendance records for employees without attendance
            const employeesWithoutAttendance = employeesResponse.data.filter(employee => 
                !attendanceRecords.some(record => record.employeeId._id === employee._id)
            );

            // Add default attendance records
            const defaultRecords = employeesWithoutAttendance.map(employee => ({
                employeeId: {
                    _id: employee._id,
                    name: employee.name,
                    email: employee.email,
                    department: employee.department,
                    designation: employee.designation || employee.role
                },
                date: new Date(),
                status: 'absent',
                workHours: 0
            }));

            // Combine existing and default records
            setAttendance([...attendanceRecords, ...defaultRecords]);
        } catch (error) {
            console.error('Error fetching today\'s attendance:', error);
            toast.error('Failed to fetch attendance');
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendance = async (date) => {
        try {
            setLoading(true);
            // First, get all employees
            const employeesResponse = await axios.get('/api/payroll/employees');
            setEmployees(employeesResponse.data);

            // Then, get attendance records for the selected date
            const response = await axios.get('/api/attendance', {
                params: {
                    date: date.toISOString()
                }
            });

            let attendanceRecords = response.data;

            // Create default attendance records for employees without attendance
            const employeesWithoutAttendance = employeesResponse.data.filter(employee => 
                !attendanceRecords.some(record => record.employeeId._id === employee._id)
            );

            // Add default attendance records
            const defaultRecords = employeesWithoutAttendance.map(employee => ({
                employeeId: {
                    _id: employee._id,
                    name: employee.name,
                    email: employee.email,
                    department: employee.department,
                    designation: employee.designation || employee.role
                },
                date: date,
                status: 'absent',
                workHours: 0
            }));

            // Combine existing and default records
            setAttendance([...attendanceRecords, ...defaultRecords]);
        } catch (error) {
            console.error('Error fetching attendance:', error);
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
            // Check if we have a valid attendance ID
            if (!attendanceId) {
                // If no attendance record exists, create one
                const response = await axios.post('/api/attendance/bulk', {
                    records: [{
                        employeeId: selectedEmployee,
                        status: status
                    }],
                    date: selectedDate
                });
                toast.success('Attendance status updated');
                fetchAttendance(selectedDate);
            } else {
                // Update existing attendance record
                await axios.put(`/api/attendance/${attendanceId}`, {
                    status,
                    leaveType,
                    notes: `Status updated to ${status}`
                });
                toast.success('Attendance status updated');
                fetchAttendance(selectedDate);
            }
        } catch (error) {
            console.error('Error updating status:', error);
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

    const filteredAttendance = attendance.filter(record => {
        const matchesSearch = record.employeeId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            record.employeeId.department?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleTimeSelection = async () => {
        try {
            setLoading(true);
            const position = await getCurrentPosition();
            
            const endpoint = actionType === 'check-in' ? '/api/attendance/check-in' : '/api/attendance/check-out';
            
            await axios.post(endpoint, {
                employeeId: selectedEmployee,
                time: selectedTime.toISOString(),
                location: position ? [position.coords.longitude, position.coords.latitude] : undefined
            });

            toast.success(`${actionType === 'check-in' ? 'Check-in' : 'Check-out'} recorded successfully`);
            fetchAttendance(selectedDate);
            setShowTimeModal(false);
            setSelectedEmployee(null);
            setActionType(null);
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to record ${actionType}`);
        } finally {
            setLoading(false);
        }
    };

    const openTimeModal = (employeeId, type) => {
        setSelectedEmployee(employeeId);
        setActionType(type);
        setSelectedTime(new Date());
        setShowTimeModal(true);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Attendance Management</h1>
                
                {/* Controls Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    
                    <div>
                        <DatePicker
                            selected={selectedDate}
                            onChange={date => setSelectedDate(date)}
                            dateFormat="MMMM d, yyyy"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="half-day">Half Day</option>
                        <option value="leave">Leave</option>
                    </select>

                    <Button
                        onClick={() => setBulkEdit(!bulkEdit)}
                        className={`${
                            bulkEdit ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                        } text-white`}
                    >
                        {bulkEdit ? 'Cancel Bulk Edit' : 'Bulk Edit'}
                    </Button>
                </div>

                {/* Attendance Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="p-4">
                        <h3 className="text-lg font-semibold mb-2">Present</h3>
                        <p className="text-3xl font-bold text-green-500">
                            {attendance.filter(r => r.status === 'present').length}
                        </p>
                    </Card>
                    <Card className="p-4">
                        <h3 className="text-lg font-semibold mb-2">Absent</h3>
                        <p className="text-3xl font-bold text-red-500">
                            {attendance.filter(r => r.status === 'absent').length}
                        </p>
                    </Card>
                    <Card className="p-4">
                        <h3 className="text-lg font-semibold mb-2">Late</h3>
                        <p className="text-3xl font-bold text-yellow-500">
                            {attendance.filter(r => r.status === 'late').length}
                        </p>
                    </Card>
                    <Card className="p-4">
                        <h3 className="text-lg font-semibold mb-2">On Leave</h3>
                        <p className="text-3xl font-bold text-purple-500">
                            {attendance.filter(r => r.status === 'leave').length}
                        </p>
                    </Card>
                </div>

                {/* Time Selection Modal */}
                {showTimeModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
                            <h3 className="text-lg font-semibold mb-4">
                                Select {actionType === 'check-in' ? 'Check-in' : 'Check-out'} Time
                            </h3>
                            <div className="mb-4">
                                <DatePicker
                                    selected={selectedTime}
                                    onChange={(date) => setSelectedTime(date)}
                                    showTimeSelect
                                    showTimeSelectOnly
                                    timeIntervals={5}
                                    timeCaption="Time"
                                    dateFormat="h:mm aa"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button
                                    onClick={() => setShowTimeModal(false)}
                                    className="bg-gray-500 hover:bg-gray-600 text-white"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleTimeSelection}
                                    disabled={loading}
                                    className="bg-blue-500 hover:bg-blue-600 text-white"
                                >
                                    Confirm
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

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
                            {filteredAttendance.map((record) => (
                                <tr key={record.employeeId._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                    <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                                                        {record.employeeId.name.charAt(0)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {record.employeeId.name}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {record.employeeId.email}
                                                </div>
                                            </div>
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
                                            <Button
                                                onClick={() => openTimeModal(record.employeeId._id, 'check-in')}
                                                disabled={loading}
                                                className="text-xs bg-green-500 hover:bg-green-600 text-white"
                                            >
                                                <FiClock className="w-4 h-4 mr-1" />
                                                Check In
                                            </Button>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {record.checkOut?.time ? (
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {new Date(record.checkOut.time).toLocaleTimeString()}
                                            </div>
                                        ) : record.checkIn?.time ? (
                                            <Button
                                                onClick={() => openTimeModal(record.employeeId._id, 'check-out')}
                                                disabled={loading}
                                                className="text-xs bg-red-500 hover:bg-red-600 text-white"
                                            >
                                                <FiLogOut className="w-4 h-4 mr-1" />
                                                Check Out
                                            </Button>
                                        ) : null}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white">
                                            {record.workHours ? `${record.workHours}h` : '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {bulkEdit ? (
                                            <select
                                                value={record.status}
                                                onChange={(e) => handleStatusChange(record._id, e.target.value)}
                                                className="text-xs border border-gray-300 rounded-md"
                                            >
                                                <option value="present">Present</option>
                                                <option value="absent">Absent</option>
                                                <option value="late">Late</option>
                                                <option value="half-day">Half Day</option>
                                                <option value="leave">Leave</option>
                                            </select>
                                        ) : (
                                            <div className="flex space-x-2">
                                                <Button
                                                    onClick={() => handleStatusChange(record._id || null, 'present')}
                                                    className="text-xs bg-green-500 hover:bg-green-600 text-white"
                                                >
                                                    <FiCheck className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    onClick={() => handleStatusChange(record._id || null, 'absent')}
                                                    className="text-xs bg-red-500 hover:bg-red-600 text-white"
                                                >
                                                    <FiX className="w-4 h-4" />
                                                </Button>
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