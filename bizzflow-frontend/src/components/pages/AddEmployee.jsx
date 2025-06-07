import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../utils/axios';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const AddEmployee = ({ onClose }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        department: '',
        basicSalary: '',
        employmentDetails: {
            joinDate: '',
            employmentType: 'full-time',
            designation: '',
            probationPeriod: 3,
            workLocation: 'office',
            reportingTo: '',
            workHours: '40',
            shiftType: 'day'
        },
        personalDetails: {
            dateOfBirth: '',
            gender: '',
            maritalStatus: '',
            nationality: '',
            address: {
                street: '',
                city: '',
                state: '',
                country: '',
                postalCode: ''
            }
        },
        bankDetails: {
            accountName: '',
            accountNumber: '',
            bankName: '',
            branch: '',
            ifscCode: '',
            accountType: 'savings'
        },
        educationDetails: {
            highestQualification: '',
            fieldOfStudy: '',
            institution: '',
            yearOfCompletion: ''
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [section, field] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            personalDetails: {
                ...prev.personalDetails,
                address: {
                    ...prev.personalDetails.address,
                    [name]: value
                }
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post('/api/users', formData);
            toast.success('Employee added successfully');
            onClose();
            navigate('/payroll');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add employee');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Add New Employee</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name *</label>
                        <Input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email *</label>
                        <Input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone *</label>
                        <Input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department *</label>
                        <Input
                            type="text"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Basic Salary *</label>
                        <Input
                            type="number"
                            name="basicSalary"
                            value={formData.basicSalary}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                {/* Employment Details */}
                <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-4">Employment Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Join Date *</label>
                            <Input
                                type="date"
                                name="employmentDetails.joinDate"
                                value={formData.employmentDetails.joinDate}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Employment Type</label>
                            <select
                                name="employmentDetails.employmentType"
                                value={formData.employmentDetails.employmentType}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="full-time">Full Time</option>
                                <option value="part-time">Part Time</option>
                                <option value="contract">Contract</option>
                                <option value="intern">Intern</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Designation *</label>
                            <Input
                                type="text"
                                name="employmentDetails.designation"
                                value={formData.employmentDetails.designation}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Work Location</label>
                            <select
                                name="employmentDetails.workLocation"
                                value={formData.employmentDetails.workLocation}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="office">Office</option>
                                <option value="remote">Remote</option>
                                <option value="hybrid">Hybrid</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Personal Details */}
                <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-4">Personal Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
                            <Input
                                type="date"
                                name="personalDetails.dateOfBirth"
                                value={formData.personalDetails.dateOfBirth}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                            <select
                                name="personalDetails.gender"
                                value={formData.personalDetails.gender}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Marital Status</label>
                            <select
                                name="personalDetails.maritalStatus"
                                value={formData.personalDetails.maritalStatus}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Select Status</option>
                                <option value="single">Single</option>
                                <option value="married">Married</option>
                                <option value="divorced">Divorced</option>
                                <option value="widowed">Widowed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nationality</label>
                            <Input
                                type="text"
                                name="personalDetails.nationality"
                                value={formData.personalDetails.nationality}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Street Address</label>
                            <Input
                                type="text"
                                name="street"
                                value={formData.personalDetails.address.street}
                                onChange={handleAddressChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                            <Input
                                type="text"
                                name="city"
                                value={formData.personalDetails.address.city}
                                onChange={handleAddressChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
                            <Input
                                type="text"
                                name="state"
                                value={formData.personalDetails.address.state}
                                onChange={handleAddressChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
                            <Input
                                type="text"
                                name="country"
                                value={formData.personalDetails.address.country}
                                onChange={handleAddressChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Postal Code</label>
                            <Input
                                type="text"
                                name="postalCode"
                                value={formData.personalDetails.address.postalCode}
                                onChange={handleAddressChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Bank Details */}
                <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-4">Bank Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account Name</label>
                            <Input
                                type="text"
                                name="bankDetails.accountName"
                                value={formData.bankDetails.accountName}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account Number</label>
                            <Input
                                type="text"
                                name="bankDetails.accountNumber"
                                value={formData.bankDetails.accountNumber}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bank Name</label>
                            <Input
                                type="text"
                                name="bankDetails.bankName"
                                value={formData.bankDetails.bankName}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Branch</label>
                            <Input
                                type="text"
                                name="bankDetails.branch"
                                value={formData.bankDetails.branch}
                                onChange={handleChange}
                            />
                        </div>
                        
                        
                        
                        
                
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account Type</label>
                            <select
                                name="bankDetails.accountType"
                                value={formData.bankDetails.accountType}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="savings">Savings</option>
                                <option value="current">Current</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Education Details */}
                <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-4">Education Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Highest Qualification</label>
                            <Input
                                type="text"
                                name="educationDetails.highestQualification"
                                value={formData.educationDetails.highestQualification}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Field of Study</label>
                            <Input
                                type="text"
                                name="educationDetails.fieldOfStudy"
                                value={formData.educationDetails.fieldOfStudy}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Institution</label>
                            <Input
                                type="text"
                                name="educationDetails.institution"
                                value={formData.educationDetails.institution}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Year of Completion</label>
                            <Input
                                type="number"
                                name="educationDetails.yearOfCompletion"
                                value={formData.educationDetails.yearOfCompletion}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button
                        type="button"
                        onClick={onClose}
                        variant="secondary"
                        size="md"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={loading}
                        disabled={loading}
                    >
                        {loading ? 'Adding...' : 'Add Employee'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddEmployee; 