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
  UserPlus,
} from "lucide-react";
import { Button } from "../ui/Button";
import StatCard from "../ui/Statcard";
import { Input } from "../ui/Input";
import Label from "../ui/Label";
import Card from "../ui/Card";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiPlus, FiX } from 'react-icons/fi';
import AddEmployee from './AddEmployee';

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
      if (!formData.salary.basic) errors.push("Basic salary is required");
      if (isNaN(Number(formData.salary.basic)) || Number(formData.salary.basic) <= 0) {
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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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
      // Generate a unique employee ID
      const employeeId = `EMP${Date.now().toString().slice(-6)}`;

      // Prepare the employee data according to the schema
      const employeeData = {
        name: newEmployee.name,
        employeeId: employeeId,
        email: newEmployee.email,
        phone: newEmployee.phone,
        department: newEmployee.department,
        designation: newEmployee.employmentDetails.designation,
        joiningDate: new Date(newEmployee.employmentDetails.joinDate).toISOString(),
        salary: {
          basic: Number(newEmployee.salary.basic),
          allowances: Number(newEmployee.salary.allowances) || 0,
          deductions: Number(newEmployee.salary.deductions) || 0
        },
        bankDetails: {
          accountName: newEmployee.bankDetails.accountName,
          accountNumber: newEmployee.bankDetails.accountNumber,
          bankName: newEmployee.bankDetails.bankName,
          branchName: newEmployee.bankDetails.branch,
          ifscCode: newEmployee.bankDetails.ifscCode
        },
        status: 'active',
        emergencyContact: newEmployee.emergencyContact || {}
      };

      console.log('Sending employee data:', employeeData);

      // First create the employee
      const response = await axios.post('/api/employees', employeeData);
      
      if (response.data) {
        // Now create the initial payroll entry
        const payrollData = {
          employee: response.data._id,
          basicSalary: Number(newEmployee.salary.basic),
          month: new Date().toLocaleString('default', { month: 'long' }).toLowerCase(),
          year: new Date().getFullYear(),
          allowances: Number(newEmployee.salary.allowances) || 0,
          deductions: Number(newEmployee.salary.deductions) || 0
        };

        await axios.post('/api/payroll', payrollData);
      }

      toast.success('Employee added successfully');
      setEmployees([...employees, response.data]);
      setNewEmployee(initialEmployeeForm);
      setShowAddForm(false);
      setShowAddModal(false);
      await fetchEmployees(); // Refresh the list
    } catch (error) {
      console.error('Error adding employee:', error.response || error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg || 
                          'Failed to add employee';
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

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payroll Management</h1>
          <Button
            onClick={() => setShowAddModal(true)}
            variant="primary"
            size="md"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {months.map((month, index) => (
              <option key={month} value={index}>{month}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Employee Table */}
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
                  Basic Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center">
                    No employees found
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr key={employee._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                              {employee.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {employee.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {employee.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {employee.department}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {employee.employmentDetails?.designation}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        ${employee.basicSalary?.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        onClick={() => handleGeneratePayroll(employee._id)}
                        disabled={loading}
                        variant="success"
                        size="sm"
                        isLoading={loading}
                      >
                        Generate Payroll
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <AddEmployee onClose={() => {
            setShowAddModal(false);
            fetchEmployees();
          }} />
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default Payroll;
