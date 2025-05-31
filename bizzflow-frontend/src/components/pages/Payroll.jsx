import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  UserCircle,
  CalendarCheck2,
  FileText,
  BadgeDollarSign,
  Download,
  PlusCircle,
  MinusCircle,
  Search,
  Edit,
  Trash2,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Briefcase,
  GraduationCap,
  Home,
  Globe,
  AlertCircle,
  Receipt,
} from "lucide-react";
import { Button } from "../ui/Button";
import StatCard from "../ui/Statcard";
import { Input } from "../ui/Input";
import Label from "../ui/Label";
import Card from "../ui/Card";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const initialEmployeeForm = {
  name: "",
  email: "",
  password: "employee123",
  phone: "",
  role: "employee",
  department: "",
  basicSalary: "",
  employmentDetails: {
    employmentType: "full-time",
    designation: "",
    joinDate: new Date().toISOString().split('T')[0],
    probationPeriod: 3,
    workLocation: "office", // office, remote, hybrid
    reportingTo: "",
    workHours: "40",
    shiftType: "day" // day, night, flexible
  },
  personalDetails: {
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    nationality: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: ""
    }
  },
  educationDetails: {
    highestQualification: "",
    fieldOfStudy: "",
    institution: "",
    yearOfCompletion: ""
  },
  bankDetails: {
    accountName: "",
    accountNumber: "",
    bankName: "",
    branch: "",
    ifscCode: "",
    accountType: "savings" // savings, current
  },
  documents: {
    idProof: "",
    addressProof: "",
    resume: "",
    offerLetter: "",
    photo: ""
  },
  emergencyContact: {
    name: "",
    relationship: "",
    phone: "",
    address: ""
  }
};

const FormTab = ({ active, onClick, icon: Icon, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
      active 
        ? 'bg-primary text-white shadow-lg' 
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`}
  >
    <Icon className="w-4 h-4" />
    <span>{children}</span>
  </button>
);

const validateForm = (formData, currentTab) => {
  const errors = [];
  
  switch(currentTab) {
    case 0: // Personal Info
      if (!formData.name) errors.push("Name is required");
      if (!formData.email) errors.push("Email is required");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.push("Invalid email format");
      if (!formData.phone) errors.push("Phone is required");
      if (!/^\d{10}$/.test(formData.phone)) errors.push("Phone must be 10 digits");
      break;
      
    case 1: // Employment
      if (!formData.employmentDetails.designation) errors.push("Designation is required");
      if (!formData.basicSalary) errors.push("Basic salary is required");
      if (isNaN(Number(formData.basicSalary)) || Number(formData.basicSalary) <= 0) {
        errors.push("Basic salary must be a positive number");
      }
      if (!formData.department) errors.push("Department is required");
      if (!formData.employmentDetails.joinDate) errors.push("Join date is required");
      break;
      
    case 2: // Bank Details
      if (!formData.bankDetails.accountName) errors.push("Account name is required");
      if (!formData.bankDetails.accountNumber) errors.push("Account number is required");
      if (!formData.bankDetails.bankName) errors.push("Bank name is required");
      if (!formData.bankDetails.branch) errors.push("Branch is required");
      break;
      
    case 3: // Education
      // Education fields are optional
      break;
      
    case 4: // Documents
      // Document fields are optional
      break;
  }
  
  return errors;
};

const Payroll = () => {
  const [employees, setEmployees] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newEmployee, setNewEmployee] = useState(initialEmployeeForm);
  const [loading, setLoading] = useState(false);
  const [currentMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [currentYear] = useState(new Date().getFullYear());
  const [currentTab, setCurrentTab] = useState(0);
  const [formErrors, setFormErrors] = useState([]);

  // Fetch employees and payrolls
  useEffect(() => {
    fetchEmployees();
    fetchPayrolls();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/payroll/employees');
      setEmployees(response.data);
      if (!selectedEmployee && response.data.length > 0) {
        setSelectedEmployee(response.data[0]);
      }
    } catch (error) {
      toast.error('Failed to fetch employees');
      console.error('Error fetching employees:', error);
    }
  };

  const fetchPayrolls = async () => {
    try {
      const response = await axios.get('/api/payroll', {
        params: {
          month: currentMonth,
          year: currentYear
        }
      });
      setPayrolls(response.data);
    } catch (error) {
      toast.error('Failed to fetch payrolls');
      console.error('Error fetching payrolls:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 2) {
        // Handle two-level nesting (e.g., personalDetails.dateOfBirth)
        setNewEmployee(prev => ({
          ...prev,
          [parts[0]]: {
            ...prev[parts[0]],
            [parts[1]]: value
          }
        }));
      } else if (parts.length === 3) {
        // Handle three-level nesting (e.g., personalDetails.address.street)
        setNewEmployee(prev => ({
          ...prev,
          [parts[0]]: {
            ...prev[parts[0]],
            [parts[1]]: {
              ...prev[parts[0]]?.[parts[1]],
              [parts[2]]: value
            }
          }
        }));
      }
    } else {
      setNewEmployee(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    
    // Validate all tabs before submission
    let allErrors = [];
    for (let tab = 0; tab <= 4; tab++) {
      const tabErrors = validateForm(newEmployee, tab);
      allErrors = [...allErrors, ...tabErrors];
    }
    
    if (allErrors.length > 0) {
      setFormErrors(allErrors);
      return;
    }

    setLoading(true);

    try {
      const employeeData = {
        ...newEmployee,
        basicSalary: Number(newEmployee.basicSalary),
        employmentDetails: {
          ...newEmployee.employmentDetails,
          joinDate: new Date(newEmployee.employmentDetails.joinDate).toISOString()
        },
        personalDetails: {
          ...newEmployee.personalDetails,
          dateOfBirth: newEmployee.personalDetails.dateOfBirth ? 
            new Date(newEmployee.personalDetails.dateOfBirth).toISOString() : undefined
        }
      };

      const response = await axios.post('/api/users', employeeData);
      toast.success('Employee added successfully');
      setEmployees([...employees, response.data]);
      setNewEmployee(initialEmployeeForm);
      setShowAddForm(false);
      fetchEmployees(); // Refresh the list
    } catch (error) {
      console.error('Error adding employee:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Failed to add employee';
      toast.error(errorMessage);
      setFormErrors([errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleNextTab = () => {
    const errors = validateForm(newEmployee, currentTab);
    if (errors.length === 0) {
      setCurrentTab(prev => prev + 1);
      setFormErrors([]);
    } else {
      setFormErrors(errors);
    }
  };

  const handleGeneratePayroll = async (employeeId) => {
    try {
      setLoading(true);
      const employee = employees.find(emp => emp._id === employeeId);
      if (!employee) {
        toast.error('Employee not found');
        return;
      }

      // Calculate allowances (example: 10% of basic salary)
      const allowances = employee.basicSalary * 0.1;
      
      // Calculate deductions (example: 5% of basic salary)
      const deductions = employee.basicSalary * 0.05;
      
      // Calculate bonus (example: 8.33% of basic salary - one month salary divided by 12)
      const bonus = employee.basicSalary * 0.0833;

      const payrollData = {
        employee: employeeId,
        basicSalary: employee.basicSalary,
        month: currentMonth,
        year: currentYear,
        allowances,
        deductions,
        bonus
      };

      console.log('Sending payroll data:', payrollData); // Debug log

      const response = await axios.post('/api/payroll', payrollData);
      console.log('Payroll response:', response.data); // Debug log
      
      toast.success('Payroll generated successfully');
      fetchPayrolls();
    } catch (error) {
      console.error('Error generating payroll:', error);
      console.error('Error response:', error.response?.data); // Debug log
      toast.error(error.response?.data?.message || 'Failed to generate payroll');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    
    try {
      await axios.delete(`/api/users/${id}`);
      toast.success('Employee deleted successfully');
      setEmployees(employees.filter(emp => emp._id !== id));
      if (selectedEmployee?._id === id) {
        setSelectedEmployee(employees[0]);
      }
    } catch (error) {
      toast.error('Failed to delete employee');
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">Payroll Management</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage employee payroll and records</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto justify-center"
          size="lg"
        >
          {showAddForm ? <MinusCircle className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
          {showAddForm ? 'Cancel' : 'Add Employee'}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={employees.length}
          icon={<UserCircle className="w-6 h-6 text-primary dark:text-primary" />}
          className="text-gray-900 dark:text-white"
        />
        <StatCard
          title="Total Payroll"
          value={`₹${payrolls.reduce((acc, curr) => acc + curr.netSalary, 0).toLocaleString()}`}
          icon={<BadgeDollarSign className="w-6 h-6 text-primary dark:text-primary" />}
          className="text-gray-900 dark:text-white"
        />
        <StatCard
          title="Pending Payrolls"
          value={payrolls.filter(p => p.status === 'pending').length}
          icon={<CalendarCheck2 className="w-6 h-6 text-primary dark:text-primary" />}
          className="text-gray-900 dark:text-white"
        />
        <StatCard
          title="Processed Payrolls"
          value={payrolls.filter(p => p.status === 'paid').length}
          icon={<FileText className="w-6 h-6 text-primary dark:text-primary" />}
          className="text-gray-900 dark:text-white"
        />
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
        <Input
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full max-w-md text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      {/* Employee List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Cards */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEmployees.map((employee) => (
              <Card key={employee._id} className="p-4 hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-800">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                      <UserCircle className="w-6 h-6 text-primary dark:text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{employee.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{employee.department || 'No Department'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleGeneratePayroll(employee._id)}
                      className="h-8 w-8 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
                    >
                      <Receipt className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteEmployee(employee._id)}
                      className="h-8 w-8 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span>{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <BadgeDollarSign className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span>₹{employee.basicSalary?.toLocaleString() || 0}/month</span>
                  </div>
                  {employee.phone && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <span>{employee.phone}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Payrolls */}
        <div className="lg:col-span-1">
          <Card className="p-4 bg-white dark:bg-gray-800">
            <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Recent Payrolls</h3>
            <div className="space-y-4">
              {payrolls.slice(0, 5).map((payroll) => (
                <div key={payroll._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{payroll.employee.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {payroll.month} {payroll.year}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">₹{payroll.netSalary.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      payroll.status === 'paid' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {payroll.status.charAt(0).toUpperCase() + payroll.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Add Employee Form */}
      {showAddForm && (
        <Card className="p-4 sm:p-6 bg-white dark:bg-gray-800/40 shadow-xl border dark:border-gray-700 rounded-xl mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 pb-4 border-b dark:border-gray-700">
            <div className="p-3 rounded-lg bg-primary/10 dark:bg-primary/20">
              <UserCircle className="w-6 h-6 text-primary dark:text-primary" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Add New Employee</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Complete all required information</p>
            </div>
          </div>

          {/* Form Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            <FormTab 
              active={currentTab === 0} 
              onClick={() => setCurrentTab(0)}
              icon={UserCircle}
            >
              Personal Info
            </FormTab>
            <FormTab 
              active={currentTab === 1} 
              onClick={() => setCurrentTab(1)}
              icon={Briefcase}
            >
              Employment
            </FormTab>
            <FormTab 
              active={currentTab === 2} 
              onClick={() => setCurrentTab(2)}
              icon={CreditCard}
            >
              Bank Details
            </FormTab>
            <FormTab 
              active={currentTab === 3} 
              onClick={() => setCurrentTab(3)}
              icon={GraduationCap}
            >
              Education
            </FormTab>
            <FormTab 
              active={currentTab === 4} 
              onClick={() => setCurrentTab(4)}
              icon={FileText}
            >
              Documents
            </FormTab>
          </div>

          {/* Error Display */}
          {formErrors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Please correct the following errors:</span>
              </div>
              <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400">
                {formErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleAddEmployee} className="space-y-8">
            {/* Personal Information Tab */}
            {currentTab === 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label required>Full Name</Label>
                    <Input
                      required
                      name="name"
                      value={newEmployee.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label required>Email</Label>
                    <Input
                      required
                      type="email"
                      name="email"
                      value={newEmployee.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className="text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label required>Phone</Label>
                    <Input
                      required
                      name="phone"
                      value={newEmployee.phone}
                      onChange={handleInputChange}
                      placeholder="9876543210"
                      className="text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label required>Date of Birth</Label>
                    <Input
                      required
                      type="date"
                      name="personalDetails.dateOfBirth"
                      value={newEmployee.personalDetails.dateOfBirth}
                      onChange={handleInputChange}
                      className="text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <select
                      name="personalDetails.gender"
                      value={newEmployee.personalDetails.gender}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Marital Status</Label>
                    <select
                      name="personalDetails.maritalStatus"
                      value={newEmployee.personalDetails.maritalStatus}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
                    >
                      <option value="">Select Status</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                      <option value="widowed">Widowed</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Address Details</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Input
                        name="personalDetails.address.street"
                        value={newEmployee.personalDetails.address.street || ''}
                        onChange={handleInputChange}
                        placeholder="Street Address (e.g., House No., Street Name, Area)"
                        className="text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>
                    <Input
                      name="personalDetails.address.city"
                      value={newEmployee.personalDetails.address.city || ''}
                      onChange={handleInputChange}
                      placeholder="City (e.g., Kathmandu)"
                      className="text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                    <Input
                      name="personalDetails.address.state"
                      value={newEmployee.personalDetails.address.state || ''}
                      onChange={handleInputChange}
                      placeholder="Province/State (e.g., Bagmati)"
                      className="text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                    <Input
                      name="personalDetails.address.country"
                      value={newEmployee.personalDetails.address.country || ''}
                      onChange={handleInputChange}
                      placeholder="Country (e.g., Nepal)"
                      className="text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                    <Input
                      name="personalDetails.address.postalCode"
                      value={newEmployee.personalDetails.address.postalCode || ''}
                      onChange={handleInputChange}
                      placeholder="Postal Code (e.g., 44600)"
                      className="text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Employment Details Tab */}
            {currentTab === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label required>Department</Label>
                    <Input
                      required
                      name="department"
                      value={newEmployee.department}
                      onChange={handleInputChange}
                      placeholder="Engineering"
                      className="text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label required>Designation</Label>
                    <Input
                      required
                      name="employmentDetails.designation"
                      value={newEmployee.employmentDetails.designation}
                      onChange={handleInputChange}
                      placeholder="Software Engineer"
                      className="text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label required>Basic Salary</Label>
                    <Input
                      required
                      type="number"
                      name="basicSalary"
                      value={newEmployee.basicSalary}
                      onChange={handleInputChange}
                      placeholder="50000"
                      className="text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Employment Type</Label>
                    <select
                      name="employmentDetails.employmentType"
                      value={newEmployee.employmentDetails.employmentType}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
                    >
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="intern">Intern</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label required>Join Date</Label>
                    <Input
                      required
                      type="date"
                      name="employmentDetails.joinDate"
                      value={newEmployee.employmentDetails.joinDate}
                      onChange={handleInputChange}
                      className="text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Work Location</Label>
                    <select
                      name="employmentDetails.workLocation"
                      value={newEmployee.employmentDetails.workLocation}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
                    >
                      <option value="office">Office</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Reporting To</Label>
                    <Input
                      name="employmentDetails.reportingTo"
                      value={newEmployee.employmentDetails.reportingTo}
                      onChange={handleInputChange}
                      placeholder="Manager's Name"
                      className="text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Shift Type</Label>
                    <select
                      name="employmentDetails.shiftType"
                      value={newEmployee.employmentDetails.shiftType}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
                    >
                      <option value="day">Day Shift</option>
                      <option value="night">Night Shift</option>
                      <option value="flexible">Flexible Hours</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Bank Details Tab */}
            {currentTab === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label required>Account Holder's Name</Label>
                    <Input
                      required
                      name="bankDetails.accountName"
                      value={newEmployee.bankDetails.accountName}
                      onChange={handleInputChange}
                      placeholder="Full name as per bank account"
                      className="text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label required>Account Number</Label>
                    <Input
                      required
                      name="bankDetails.accountNumber"
                      value={newEmployee.bankDetails.accountNumber}
                      onChange={handleInputChange}
                      placeholder="Bank account number"
                      className="text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label required>Bank Name</Label>
                    <Input
                      required
                      name="bankDetails.bankName"
                      value={newEmployee.bankDetails.bankName}
                      onChange={handleInputChange}
                      placeholder="Name of the bank"
                      className="text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label required>Branch Name</Label>
                    <Input
                      required
                      name="bankDetails.branch"
                      value={newEmployee.bankDetails.branch}
                      onChange={handleInputChange}
                      placeholder="Bank branch location"
                      className="text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <select
                      name="bankDetails.accountType"
                      value={newEmployee.bankDetails.accountType}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
                    >
                      <option value="savings">Savings</option>
                      <option value="current">Current</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Education Details Tab */}
            {currentTab === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Highest Qualification</Label>
                    <Input
                      name="educationDetails.highestQualification"
                      value={newEmployee.educationDetails.highestQualification}
                      onChange={handleInputChange}
                      placeholder="Bachelor's Degree"
                      className="text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Field of Study</Label>
                    <Input
                      name="educationDetails.fieldOfStudy"
                      value={newEmployee.educationDetails.fieldOfStudy}
                      onChange={handleInputChange}
                      placeholder="Computer Science"
                      className="text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Institution</Label>
                    <Input
                      name="educationDetails.institution"
                      value={newEmployee.educationDetails.institution}
                      onChange={handleInputChange}
                      placeholder="University Name"
                      className="text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Year of Completion</Label>
                    <Input
                      type="number"
                      name="educationDetails.yearOfCompletion"
                      value={newEmployee.educationDetails.yearOfCompletion}
                      onChange={handleInputChange}
                      placeholder="2023"
                      min="1950"
                      max={new Date().getFullYear()}
                      className="text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {currentTab === 4 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>ID Proof</Label>
                    <Input
                      type="file"
                      name="documents.idProof"
                      onChange={(e) => {
                        // Handle file upload
                        handleInputChange({
                          target: {
                            name: "documents.idProof",
                            value: e.target.files[0]?.name || ""
                          }
                        });
                      }}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address Proof</Label>
                    <Input
                      type="file"
                      name="documents.addressProof"
                      onChange={(e) => {
                        handleInputChange({
                          target: {
                            name: "documents.addressProof",
                            value: e.target.files[0]?.name || ""
                          }
                        });
                      }}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Resume</Label>
                    <Input
                      type="file"
                      name="documents.resume"
                      onChange={(e) => {
                        handleInputChange({
                          target: {
                            name: "documents.resume",
                            value: e.target.files[0]?.name || ""
                          }
                        });
                      }}
                      accept=".pdf,.doc,.docx"
                      className="text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Photo</Label>
                    <Input
                      type="file"
                      name="documents.photo"
                      onChange={(e) => {
                        handleInputChange({
                          target: {
                            name: "documents.photo",
                            value: e.target.files[0]?.name || ""
                          }
                        });
                      }}
                      accept="image/*"
                      className="text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Form Navigation Buttons */}
            <div className="flex justify-between items-center gap-4 pt-4 border-t dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <div className="flex gap-2">
                {currentTab > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentTab(prev => prev - 1)}
                  >
                    Previous
                  </Button>
                )}
                {currentTab < 4 ? (
                  <Button
                    type="button"
                    onClick={handleNextTab}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading}
                    className="min-w-[120px]"
                    onClick={handleAddEmployee}
                  >
                    {loading ? 'Adding...' : 'Add Employee'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Card>
      )}
      <ToastContainer />
    </div>
  );
};

export default Payroll;
