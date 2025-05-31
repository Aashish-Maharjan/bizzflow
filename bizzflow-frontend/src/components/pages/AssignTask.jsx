import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  UserCircle,
  Calendar,
  Clock,
  Tag,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  Building2,
  Users,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import Label from '../ui/Label';
import Card from '../ui/Card';

const AssignTask = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [departments, setDepartments] = useState([]);

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    category: '',
    priority: 'medium',
    assignedTo: '',
    department: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    // Extract unique departments
    const depts = [...new Set(employees.map(emp => emp.department))];
    setDepartments(depts);

    // Filter employees based on search and department
    const filtered = employees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = !departmentFilter || emp.department === departmentFilter;
      
      return matchesSearch && matchesDepartment;
    });
    
    setFilteredEmployees(filtered);
  }, [employees, searchTerm, departmentFilter]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users');
      setEmployees(response.data.filter(user => user.role === 'employee'));
    } catch (error) {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setTaskForm(prev => ({
      ...prev,
      assignedTo: employee._id,
      department: employee.department
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) {
      toast.error('Please select an employee');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/api/tasks', taskForm);
      toast.success('Task assigned successfully');
      setTaskForm({
        title: '',
        description: '',
        dueDate: '',
        category: '',
        priority: 'medium',
        assignedTo: '',
        department: ''
      });
      setSelectedEmployee(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">Assign Task</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Select an employee and assign a task</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Selection Section */}
        <div className="lg:col-span-1">
          <Card className="p-4 bg-white dark:bg-gray-800">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              <div>
                <Label>Filter by Department</Label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full mt-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredEmployees.map(employee => (
                  <div
                    key={employee._id}
                    onClick={() => handleEmployeeSelect(employee)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedEmployee?._id === employee._id
                        ? 'bg-primary/10 dark:bg-primary/20 border-primary'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                        <UserCircle className="w-6 h-6 text-primary dark:text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{employee.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{employee.department}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Task Form Section */}
        <div className="lg:col-span-2">
          <Card className="p-6 bg-white dark:bg-gray-800">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label required>Task Title</Label>
                <Input
                  required
                  name="title"
                  value={taskForm.title}
                  onChange={handleInputChange}
                  placeholder="Enter task title"
                  className="text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <Label required>Description</Label>
                <textarea
                  required
                  name="description"
                  value={taskForm.description}
                  onChange={handleInputChange}
                  placeholder="Enter task description"
                  rows={4}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label required>Due Date</Label>
                  <Input
                    required
                    type="date"
                    name="dueDate"
                    value={taskForm.dueDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <Label required>Category</Label>
                  <Input
                    required
                    name="category"
                    value={taskForm.category}
                    onChange={handleInputChange}
                    placeholder="Enter task category"
                    className="text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <Label>Priority</Label>
                  <select
                    name="priority"
                    value={taskForm.priority}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {selectedEmployee && (
                <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <UserCircle className="w-6 h-6 text-primary dark:text-primary" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Assigning to: {selectedEmployee.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEmployee.department}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-4">
                <Button
                  type="submit"
                  disabled={loading || !selectedEmployee}
                  className="min-w-[120px]"
                >
                  {loading ? 'Assigning...' : 'Assign Task'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AssignTask; 