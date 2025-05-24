import React, { useState } from "react";
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

const initialEmployeeForm = {
  name: "",
  email: "",
  role: "",
  salary: "",
  pan: "",
  phone: "",
  address: "",
  joiningDate: "",
  bankName: "",
  accountNumber: "",
  workingDays: 22,
  leaves: 0,
  bonuses: 0,
  deductions: 0,
};

const mockEmployees = [
  {
    id: 1,
    name: "Aayush Shrestha",
    email: "aayush@bizflow.com",
    role: "Software Engineer",
    salary: 80000,
    pan: "PAN1234567",
    phone: "9801234567",
    address: "Kathmandu, Nepal",
    joiningDate: "2024-01-15",
    bankName: "NIC Asia",
    accountNumber: "1234567890",
    workingDays: 22,
    leaves: 2,
    bonuses: 5000,
    deductions: 3000,
  },
];

const Payroll = () => {
  const [employees, setEmployees] = useState(mockEmployees);
  const [selectedEmployee, setSelectedEmployee] = useState(employees[0]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newEmployee, setNewEmployee] = useState(initialEmployeeForm);

  const calculateNetSalary = (employee) => {
    const perDaySalary = employee.salary / 26;
    const salaryAfterLeaves = perDaySalary * (employee.workingDays - employee.leaves);
    return salaryAfterLeaves + employee.bonuses - employee.deductions;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddEmployee = (e) => {
    e.preventDefault();
    const employeeData = {
      ...newEmployee,
      id: employees.length + 1,
      salary: Number(newEmployee.salary),
      workingDays: Number(newEmployee.workingDays) || 22,
      leaves: Number(newEmployee.leaves) || 0,
      bonuses: Number(newEmployee.bonuses) || 0,
      deductions: Number(newEmployee.deductions) || 0,
    };
    
    setEmployees([...employees, employeeData]);
    setNewEmployee(initialEmployeeForm);
    setShowAddForm(false);
  };

  const handleDeleteEmployee = (id) => {
    setEmployees(employees.filter(emp => emp.id !== id));
    if (selectedEmployee?.id === id) {
      setSelectedEmployee(employees[0]);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-white mb-1">Payroll & Attendance</h1>
          <p className="text-sm sm:text-base text-muted-foreground dark:text-gray-400">Manage employee payroll and attendance records</p>
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
                  <Label className="text-sm font-medium text-foreground dark:text-gray-100">Full Name</Label>
                  <div className="relative flex items-center">
                    <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
                    <Input
                      required
                      name="name"
                      value={newEmployee.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="pl-9 w-full dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground dark:text-gray-100">Email</Label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
                    <Input
                      required
                      type="email"
                      name="email"
                      value={newEmployee.email}
                      onChange={handleInputChange}
                      placeholder="john@bizflow.com"
                      className="pl-9 w-full dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground dark:text-gray-100">Phone Number</Label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
                    <Input
                      required
                      name="phone"
                      value={newEmployee.phone}
                      onChange={handleInputChange}
                      placeholder="9801234567"
                      className="pl-9 w-full dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground dark:text-gray-100">Address</Label>
                  <div className="relative flex items-center">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
                    <Input
                      required
                      name="address"
                      value={newEmployee.address}
                      onChange={handleInputChange}
                      placeholder="Kathmandu, Nepal"
                      className="pl-9 w-full dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 focus:ring-2 focus:ring-primary"
                    />
                  </div>
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
                  <Label className="text-sm font-medium text-foreground dark:text-gray-100">Role</Label>
                  <div className="relative flex items-center">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
                    <Input
                      required
                      name="role"
                      value={newEmployee.role}
                      onChange={handleInputChange}
                      placeholder="Software Engineer"
                      className="pl-9 w-full dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground dark:text-gray-100">Monthly Salary</Label>
                  <div className="relative flex items-center">
                    <BadgeDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
                    <Input
                      required
                      type="number"
                      name="salary"
                      value={newEmployee.salary}
                      onChange={handleInputChange}
                      placeholder="80000"
                      className="pl-9 w-full dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground dark:text-gray-100">Joining Date</Label>
                  <div className="relative flex items-center">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
                    <Input
                      required
                      type="date"
                      name="joiningDate"
                      value={newEmployee.joiningDate}
                      onChange={handleInputChange}
                      className="pl-9 w-full dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground dark:text-gray-100">PAN Number</Label>
                  <div className="relative flex items-center">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
                    <Input
                      required
                      name="pan"
                      value={newEmployee.pan}
                      onChange={handleInputChange}
                      placeholder="PAN1234567"
                      className="pl-9 w-full dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-lg font-semibold text-foreground dark:text-white">
                <Building2 className="w-5 h-5 text-primary" />
                <h3>Bank Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground dark:text-gray-100">Bank Name</Label>
                  <div className="relative flex items-center">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
                    <Input
                      required
                      name="bankName"
                      value={newEmployee.bankName}
                      onChange={handleInputChange}
                      placeholder="NIC Asia"
                      className="pl-9 w-full dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground dark:text-gray-100">Account Number</Label>
                  <div className="relative flex items-center">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
                    <Input
                      required
                      name="accountNumber"
                      value={newEmployee.accountNumber}
                      onChange={handleInputChange}
                      placeholder="1234567890"
                      className="pl-9 w-full dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Add Employee
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Employee List and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Employee List */}
        <Card className="lg:col-span-1 p-4 sm:p-6 bg-card dark:bg-gray-800/40 shadow-xl border dark:border-gray-700 rounded-xl order-2 lg:order-1">
          <div className="space-y-4 sm:space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div className="space-y-2 sm:space-y-3 max-h-[calc(100vh-400px)] sm:max-h-[calc(100vh-300px)] overflow-y-auto pr-2 custom-scrollbar">
              {filteredEmployees.map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp)}
                  className={`p-3 sm:p-4 rounded-xl cursor-pointer flex items-center justify-between group transition-all duration-200 ${
                    selectedEmployee?.id === emp.id
                      ? 'bg-primary/10 dark:bg-primary/20 shadow-md'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      selectedEmployee?.id === emp.id
                        ? 'bg-primary/20 dark:bg-primary/30'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <UserCircle className="w-5 sm:w-6 h-5 sm:h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm sm:text-base text-foreground dark:text-gray-100">{emp.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground dark:text-gray-400">{emp.role}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEmployee(emp.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Employee Details */}
        {selectedEmployee && (
          <Card className="lg:col-span-2 p-4 sm:p-8 bg-card dark:bg-gray-800/40 shadow-xl border dark:border-gray-700 rounded-xl order-1 lg:order-2">
            <div className="space-y-6 sm:space-y-10">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-primary/10 dark:bg-primary/20">
                    <UserCircle className="w-6 sm:w-8 h-6 sm:h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-foreground dark:text-white">{selectedEmployee.name}</h2>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">{selectedEmployee.role}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-colors shadow hover:shadow-md"
                >
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <StatCard 
                  title="Working Days" 
                  value={selectedEmployee.workingDays}
                  icon={<CalendarCheck2 className="w-5 h-5 text-primary" />}
                />
                <StatCard 
                  title="Leaves" 
                  value={selectedEmployee.leaves}
                  icon={<Calendar className="w-5 h-5 text-yellow-500" />}
                />
                <StatCard 
                  title="Bonuses" 
                  value={`Rs. ${selectedEmployee.bonuses}`}
                  icon={<BadgeDollarSign className="w-5 h-5 text-green-500" />}
                />
                <StatCard 
                  title="Deductions" 
                  value={`Rs. ${selectedEmployee.deductions}`}
                  icon={<MinusCircle className="w-5 h-5 text-red-500" />}
                />
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                {/* Contact Information */}
                <div className="p-4 sm:p-6 rounded-xl bg-gray-50 dark:bg-gray-700/30 border dark:border-gray-700">
                  <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-400 mb-4 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm dark:text-gray-300">
                      <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      <span className="flex-1 break-all">{selectedEmployee.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm dark:text-gray-300">
                      <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      <span className="flex-1">{selectedEmployee.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm dark:text-gray-300">
                      <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      <span className="flex-1">{selectedEmployee.address}</span>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="p-4 sm:p-6 rounded-xl bg-gray-50 dark:bg-gray-700/30 border dark:border-gray-700">
                  <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-400 mb-4 flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Bank Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm dark:text-gray-300">
                      <Building2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="flex-1">{selectedEmployee.bankName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm dark:text-gray-300">
                      <CreditCard className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="flex-1">{selectedEmployee.accountNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm dark:text-gray-300">
                      <BadgeDollarSign className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="flex-1">{selectedEmployee.pan}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Salary Card */}
              <div className="p-6 rounded-xl bg-primary/5 dark:bg-primary/10 border dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10 dark:bg-primary/20">
                    <BadgeDollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">Net Salary</p>
                    <div className="text-2xl font-bold text-foreground dark:text-white">
                      Rs. {calculateNetSalary(selectedEmployee).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-6 border-t dark:border-gray-700">
                <Button className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200">
                  <FileText className="w-4 h-4" />
                  Generate Pay Slip
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export PDF
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Payroll;
