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
import { FiPlus, FiX } from 'react-icons/fi';

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
  },
  salary: {
    basic: "",
    allowances: "0",
    deductions: "0"
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
  const [payrollExists, setPayrollExists] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newEmployee, setNewEmployee] = useState(initialEmployeeForm);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentTab, setCurrentTab] = useState(0);
  const [formErrors, setFormErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch employees and payrolls
  useEffect(() => {
    const initializeData = async () => {
      try {
        await fetchEmployees();
        await fetchPayrolls();
      } catch (error) {
        console.error('Error initializing data:', error);
        toast.error('Failed to load initial data');
      }
    };

    initializeData();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/payroll/employees');
      setEmployees(response.data);
      if (!selectedEmployee && response.data.length > 0) {
        setSelectedEmployee(response.data[0]);
      }
    } catch (error) {
      toast.error('Failed to fetch employees');
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayrolls = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching payrolls...');

      // Make the initial request without parameters
      const response = await axios.get('/api/payroll');

      console.log('Received payrolls:', response.data);
      
      if (Array.isArray(response.data)) {
        setPayrolls(response.data);
        
        // Update payrollExists state
        const existingPayrolls = {};
        response.data.forEach(payroll => {
          if (payroll.employee && payroll.employee._id) {
            existingPayrolls[payroll.employee._id] = true;
          }
        });
        setPayrollExists(existingPayrolls);
      } else {
        console.error('Invalid payroll data received:', response.data);
        setPayrolls([]);
        setPayrollExists({});
      }
    } catch (error) {
      console.error('Error fetching payrolls:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error(error.response?.data?.message || 'Failed to fetch payrolls');
      setPayrolls([]);
      setPayrollExists({});
    } finally {
      setIsLoading(false);
    }
  };

  // Add a separate effect for filtering payrolls
  useEffect(() => {
    if (!isLoading && currentMonth && currentYear) {
      const filterPayrolls = async () => {
        try {
          const response = await axios.get('/api/payroll', {
            params: {
              month: currentMonth,
              year: Number(currentYear)
            }
          });

          if (Array.isArray(response.data)) {
            setPayrolls(response.data);
            
            const existingPayrolls = {};
            response.data.forEach(payroll => {
              if (payroll.employee && payroll.employee._id) {
                existingPayrolls[payroll.employee._id] = true;
              }
            });
            setPayrollExists(existingPayrolls);
          }
        } catch (error) {
          console.error('Error filtering payrolls:', error);
          // Don't show error toast here as it's not a critical error
        }
      };

      filterPayrolls();
    }
  }, [currentMonth, currentYear, isLoading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setNewEmployee(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
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
          dateOfBirth: new Employee.personalDetails.dateOfBirth ? 
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

      // Calculate allowances (10% of basic salary)
      const allowances = employee.basicSalary * 0.1;
      
      // Calculate deductions (5% of basic salary)
      const deductions = employee.basicSalary * 0.05;
      
      // Calculate bonus (8.33% of basic salary - one month salary divided by 12)
      const bonus = employee.basicSalary * 0.0833;

      const payrollData = {
        employee: employeeId,
        basicSalary: Number(employee.basicSalary),
        month: currentMonth,
        year: Number(currentYear),
        allowances: Math.round(allowances),
        deductions: Math.round(deductions),
        bonus: Math.round(bonus)
      };

      const response = await axios.post('/api/payroll', payrollData);
      
      if (response.data) {
        toast.success('Payroll generated successfully');
        if (response.data.attendance) {
          toast.info('Initial attendance record created');
        }
        if (response.data.task) {
          toast.info('Onboarding task created');
        }
        fetchPayrolls(); // Refresh the payroll list
      }
    } catch (error) {
      console.error('Error generating payroll:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg || 
                          'Failed to generate payroll';
      toast.error(errorMessage);
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

  // Add this function to check existing payroll
  const checkExistingPayroll = async (employeeId) => {
    try {
      const response = await axios.get('/api/payroll', {
        params: {
          month: currentMonth,
          year: currentYear,
          employee: employeeId
        }
      });
      return response.data.some(p => p.employee._id === employeeId);
    } catch (error) {
      console.error('Error checking existing payroll:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post('/api/payroll/employees', newEmployee);
      toast.success('Employee added successfully');
      setShowAddModal(false);
      setNewEmployee({
        name: '',
        employeeId: '',
        email: '',
        phone: '',
        department: '',
        designation: '',
        joiningDate: '',
        salary: {
          basic: '',
          allowances: '0',
          deductions: '0'
        },
        bankDetails: {
          accountName: '',
          accountNumber: '',
          bankName: '',
          branchName: '',
          ifscCode: ''
        }
      });
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">Payroll Management</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage employee payroll and records</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto justify-center"
          size="lg"
        >
          <FiPlus className="w-5 h-5" />
          Add Employee
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
                      className={`h-8 w-8 ${
                        payrollExists[employee._id]
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-600 dark:text-gray-300'
                      } hover:text-primary dark:hover:text-primary`}
                      title={payrollExists[employee._id] ? 'View Existing Payroll' : 'Generate Payroll'}
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

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Employee</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Basic Information */}
                <div className="col-span-2">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Basic Information</h4>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newEmployee.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newEmployee.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={newEmployee.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={newEmployee.department}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Designation</label>
                  <input
                    type="text"
                    name="employmentDetails.designation"
                    value={newEmployee.employmentDetails.designation}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Joining Date</label>
                  <input
                    type="date"
                    name="employmentDetails.joinDate"
                    value={newEmployee.employmentDetails.joinDate}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                {/* Salary Information */}
                <div className="col-span-2">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4 mt-4">Salary Information</h4>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Basic Salary</label>
                  <input
                    type="number"
                    name="salary.basic"
                    value={newEmployee.salary.basic}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Allowances</label>
                  <input
                    type="number"
                    name="salary.allowances"
                    value={newEmployee.salary.allowances}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deductions</label>
                  <input
                    type="number"
                    name="salary.deductions"
                    value={newEmployee.salary.deductions}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                {/* Bank Details */}
                <div className="col-span-2">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4 mt-4">Bank Details</h4>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account Name</label>
                  <input
                    type="text"
                    name="bankDetails.accountName"
                    value={newEmployee.bankDetails.accountName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account Number</label>
                  <input
                    type="text"
                    name="bankDetails.accountNumber"
                    value={newEmployee.bankDetails.accountNumber}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bank Name</label>
                  <input
                    type="text"
                    name="bankDetails.bankName"
                    value={newEmployee.bankDetails.bankName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">IFSC Code</label>
                  <input
                    type="text"
                    name="bankDetails.ifscCode"
                    value={newEmployee.bankDetails.ifscCode}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {loading ? 'Adding...' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default Payroll;
