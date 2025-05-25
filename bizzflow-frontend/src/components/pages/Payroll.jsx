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
  password: "employee123", // Default password for new employees
  phone: "",
  role: "employee",
  department: "",
  basicSalary: "",
  employmentDetails: {
    employmentType: "full-time",
    designation: "",
    joinDate: new Date().toISOString().split('T')[0]
  },
  bankDetails: {
    accountName: "",
    accountNumber: "",
    bankName: "",
    branch: ""
  }
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
      const [section, field] = name.split('.');
      setNewEmployee(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
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
    setLoading(true);
    try {
      const response = await axios.post('/api/users', newEmployee);
      toast.success('Employee added successfully');
      setEmployees([...employees, response.data]);
      setNewEmployee(initialEmployeeForm);
      setShowAddForm(false);
      fetchEmployees(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayroll = async (employeeId) => {
    try {
      const employee = employees.find(emp => emp._id === employeeId);
      if (!employee) return;

      const payrollData = {
        employee: employeeId,
        basicSalary: employee.basicSalary,
        month: currentMonth,
        year: currentYear,
        allowances: 0, // You can add these as form inputs if needed
        deductions: 0,
        bonus: 0
      };

      await axios.post('/api/payroll', payrollData);
      toast.success('Payroll generated successfully');
      fetchPayrolls();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate payroll');
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-white mb-1">Payroll Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground dark:text-gray-400">Manage employee payroll and records</p>
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
          icon={<UserCircle className="w-6 h-6" />}
        />
        <StatCard
          title="Total Payroll"
          value={`₹${payrolls.reduce((acc, curr) => acc + curr.netSalary, 0).toLocaleString()}`}
          icon={<BadgeDollarSign className="w-6 h-6" />}
        />
        <StatCard
          title="Pending Payrolls"
          value={payrolls.filter(p => p.status === 'pending').length}
          icon={<CalendarCheck2 className="w-6 h-6" />}
        />
        <StatCard
          title="Processed Payrolls"
          value={payrolls.filter(p => p.status === 'paid').length}
          icon={<FileText className="w-6 h-6" />}
        />
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full max-w-md"
        />
      </div>

      {/* Employee List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Cards */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEmployees.map((employee) => (
              <Card key={employee._id} className="p-4 hover:shadow-lg transition-shadow duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground dark:text-white">{employee.name}</h3>
                      <p className="text-sm text-muted-foreground dark:text-gray-400">{employee.department || 'No Department'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleGeneratePayroll(employee._id)}
                      className="h-8 w-8"
                    >
                      <BadgeDollarSign className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteEmployee(employee._id)}
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BadgeDollarSign className="w-4 h-4 text-gray-400" />
                    <span>₹{employee.basicSalary?.toLocaleString() || 0}/month</span>
                  </div>
                  {employee.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
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
          <Card className="p-4">
            <h3 className="font-semibold text-lg mb-4 text-foreground dark:text-white">Recent Payrolls</h3>
            <div className="space-y-4">
              {payrolls.slice(0, 5).map((payroll) => (
                <div key={payroll._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground dark:text-white">{payroll.employee.name}</p>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">
                      {payroll.month} {payroll.year}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground dark:text-white">₹{payroll.netSalary.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      payroll.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
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
        <Card className="p-4 sm:p-6 bg-card dark:bg-gray-800/40 shadow-xl border dark:border-gray-700 rounded-xl mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 pb-4 border-b dark:border-gray-700">
            <div className="p-3 rounded-lg bg-primary/10 dark:bg-primary/20">
              <UserCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground dark:text-white">Add New Employee</h2>
              <p className="text-sm text-muted-foreground dark:text-gray-400">Fill in the employee details below</p>
            </div>
          </div>

          <form onSubmit={handleAddEmployee} className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-lg font-semibold text-foreground dark:text-white">
                <UserCircle className="w-5 h-5 text-primary" />
                <h3>Personal Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    required
                    name="name"
                    value={newEmployee.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    required
                    type="email"
                    name="email"
                    value={newEmployee.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    required
                    name="phone"
                    value={newEmployee.phone}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input
                    required
                    name="department"
                    value={newEmployee.department}
                    onChange={handleInputChange}
                    placeholder="Engineering"
                  />
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-lg font-semibold text-foreground dark:text-white">
                <Building2 className="w-5 h-5 text-primary" />
                <h3>Employment Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Designation</Label>
                  <Input
                    required
                    name="employmentDetails.designation"
                    value={newEmployee.employmentDetails.designation}
                    onChange={handleInputChange}
                    placeholder="Software Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Basic Salary</Label>
                  <Input
                    required
                    type="number"
                    name="basicSalary"
                    value={newEmployee.basicSalary}
                    onChange={handleInputChange}
                    placeholder="50000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Employment Type</Label>
                  <select
                    name="employmentDetails.employmentType"
                    value={newEmployee.employmentDetails.employmentType}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
                  >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Join Date</Label>
                  <Input
                    required
                    type="date"
                    name="employmentDetails.joinDate"
                    value={newEmployee.employmentDetails.joinDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-lg font-semibold text-foreground dark:text-white">
                <CreditCard className="w-5 h-5 text-primary" />
                <h3>Bank Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Account Name</Label>
                  <Input
                    name="bankDetails.accountName"
                    value={newEmployee.bankDetails.accountName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input
                    name="bankDetails.accountNumber"
                    value={newEmployee.bankDetails.accountNumber}
                    onChange={handleInputChange}
                    placeholder="1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  <Input
                    name="bankDetails.bankName"
                    value={newEmployee.bankDetails.bankName}
                    onChange={handleInputChange}
                    placeholder="Bank Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Branch</Label>
                  <Input
                    name="bankDetails.branch"
                    value={newEmployee.bankDetails.branch}
                    onChange={handleInputChange}
                    placeholder="Branch Name"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="min-w-[120px]"
              >
                {loading ? 'Adding...' : 'Add Employee'}
              </Button>
            </div>
          </form>
        </Card>
      )}
      <ToastContainer />
    </div>
  );
};

export default Payroll;
