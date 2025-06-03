import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/Dialog";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import {
  Plus,
  Calendar,
  Clock,
  Tag,
  User2,
  MoreVertical,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import axios from 'axios';
import { toast } from 'react-toastify';

const initialColumns = {
  todo: {
    id: 'todo',
    title: 'To Do',
    color: 'bg-rose-50/50 dark:bg-rose-900/20',
    borderColor: 'border-rose-200/50 dark:border-rose-800/30',
    textColor: 'text-rose-600 dark:text-rose-400',
    hoverColor: 'hover:bg-rose-100/50 dark:hover:bg-rose-900/30',
    icon: AlertCircle,
  },
  inProgress: {
    id: 'inProgress',
    title: 'In Progress',
    color: 'bg-amber-50/50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200/50 dark:border-amber-800/30',
    textColor: 'text-amber-600 dark:text-amber-400',
    hoverColor: 'hover:bg-amber-100/50 dark:hover:bg-amber-900/30',
    icon: Clock,
  },
  completed: {
    id: 'completed',
    title: 'Completed',
    color: 'bg-emerald-50/50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-200/50 dark:border-emerald-800/30',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    hoverColor: 'hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30',
    icon: CheckCircle2,
  },
};

const priorities = [
  { id: 'high', label: 'High', icon: AlertCircle, color: 'text-rose-500 bg-rose-50/50 dark:bg-rose-900/20 border border-rose-200/50 dark:border-rose-800/30' },
  { id: 'medium', label: 'Medium', icon: Clock, color: 'text-amber-500 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30' },
  { id: 'low', label: 'Low', icon: Tag, color: 'text-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30' },
];

export default function Tasks() {
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    completed: [],
  });

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium',
    department: '',
  });

  const [activeColumn, setActiveColumn] = useState(null);
  const [activeTaskMenu, setActiveTaskMenu] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [showDialog, setShowDialog] = useState(false);

  // Fetch employees and tasks when component mounts
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('/api/payroll/employees');
        setEmployees(response.data);
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error('Failed to fetch employees');
      }
    };

    const fetchTasks = async () => {
      try {
        const response = await axios.get('/api/tasks');
        const tasksData = response.data;

        // Group tasks by status
        const groupedTasks = {
          todo: tasksData.filter(task => task.status === 'pending'),
          inProgress: tasksData.filter(task => task.status === 'in-progress'),
          completed: tasksData.filter(task => task.status === 'completed'),
        };

        setTasks(groupedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to fetch tasks');
      }
    };

    fetchEmployees();
    fetchTasks();
  }, []);

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.assignedTo) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // Find the selected employee to get their department
      const selectedEmployee = employees.find(emp => emp._id === newTask.assignedTo);

      if (!selectedEmployee) {
        toast.error('Selected employee not found');
        setIsLoading(false);
        return;
      }

      // Map frontend status to backend status
      let backendStatus = 'pending';
      if (activeColumn === 'inProgress') backendStatus = 'in-progress';
      else if (activeColumn === 'completed') backendStatus = 'completed';

      const taskData = {
        title: newTask.title,
        description: newTask.description || 'No description provided',
        assignedTo: newTask.assignedTo,
        dueDate: newTask.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: newTask.priority,
        category: 'General',
        department: selectedEmployee.department,
        status: backendStatus,
      };

      console.log('Sending task data:', taskData);

      const response = await axios.post('/api/tasks', taskData);
      const createdTask = response.data;

      console.log('Created task:', createdTask);

      // Map backend status to frontend column
      let columnKey = activeColumn;
      if (createdTask.status === 'pending') columnKey = 'todo';
      else if (createdTask.status === 'in-progress') columnKey = 'inProgress';
      else if (createdTask.status === 'completed') columnKey = 'completed';

      setTasks(prev => ({
        ...prev,
        [columnKey]: [...prev[columnKey], createdTask],
      }));

      setNewTask({
        title: '',
        description: '',
        assignedTo: '',
        dueDate: '',
        priority: 'medium',
        department: '',
      });

      setShowDialog(false);
      toast.success('Task created successfully');
    } catch (error) {
      console.error('Error creating task:', error);
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
        toast.error(`Validation errors: ${errorMessages}`);
      } else {
        toast.error(error.response?.data?.message || 'Failed to create task');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (columnId, taskId) => {
    setIsLoading(true);
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      setTasks(prev => ({
        ...prev,
        [columnId]: prev[columnId].filter(task => task._id !== taskId),
      }));
      setActiveTaskMenu(null);
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    } finally {
      setIsLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    setIsLoading(true);
    try {
      // Map frontend column to backend status
      let newStatus = destination.droppableId;
      if (destination.droppableId === 'todo') newStatus = 'pending';
      else if (destination.droppableId === 'inProgress') newStatus = 'in-progress';
      else if (destination.droppableId === 'completed') newStatus = 'completed';

      await axios.put(`/api/tasks/${draggableId}`, { status: newStatus });

      const sourceCol = [...tasks[source.droppableId]];
      const destCol = [...tasks[destination.droppableId]];
      const [movedTask] = sourceCol.splice(source.index, 1);

      if (source.droppableId === destination.droppableId) {
        sourceCol.splice(destination.index, 0, movedTask);
        setTasks(prev => ({
          ...prev,
          [source.droppableId]: sourceCol,
        }));
      } else {
        destCol.splice(destination.index, 0, { ...movedTask, status: newStatus });
        setTasks(prev => ({
          ...prev,
          [source.droppableId]: sourceCol,
          [destination.droppableId]: destCol,
        }));
      }

      toast.success('Task status updated');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {isLoading && (
        <div className="fixed inset-0 bg-black/10 dark:bg-black/20 z-50 flex items-center justify-center backdrop-blur-sm">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
            <CheckCircle2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Task Management
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Organize and track your team's tasks efficiently
            </p>
          </div>
        </div>
      </div>

      {/* Task Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
          {Object.values(initialColumns).map((column) => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`
                    flex flex-col rounded-xl border bg-white/50 dark:bg-gray-800/50
                    ${column.borderColor}
                    ${snapshot.isDraggingOver ? column.color : ''}
                    transition-all duration-200 backdrop-blur-sm
                  `}
                >
                  {/* Column Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${column.textColor}`} />
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          {column.title}
                          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                            {tasks[column.id].length}
                          </span>
                        </h3>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`${column.hoverColor} transition-colors duration-200`}
                            onClick={() => {setActiveColumn(column.id); setShowDialog(true);}}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                          <DialogHeader className="border-b dark:border-gray-700 pb-4">
                            <DialogTitle className="text-xl font-semibold">Create New Task</DialogTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Add a new task to the {column.title} column
                            </p>
                          </DialogHeader>

                          <div className="mt-6 space-y-6">
                            {/* Task Title */}
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Task Title <span className="text-red-500">*</span>
                              </label>
                              <Input
                                placeholder="Enter task title"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                className="w-full"
                              />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Description
                              </label>
                              <textarea
                                placeholder="Enter task description"
                                className="w-full min-h-[100px] max-h-[200px] rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                              />
                            </div>

                            {/* Two Column Layout */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Assignee */}
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Assignee <span className="text-red-500">*</span>
                                </label>
                                <select
                                  value={newTask.assignedTo}
                                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                  <option value="">Select an employee</option>
                                  {employees.map((employee) => (
                                    <option key={employee._id} value={employee._id}>
                                      {employee.name} - {employee.department}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Due Date */}
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Due Date
                                </label>
                                <Input
                                  type="date"
                                  value={newTask.dueDate}
                                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                  min={new Date().toISOString().split('T')[0]}
                                  className="w-full"
                                />
                              </div>
                            </div>

                            {/* Priority */}
                            <div className="space-y-3">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Priority
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {priorities.map((priority) => (
                                  <button
                                    key={priority.id}
                                    type="button"
                                    onClick={() => setNewTask({ ...newTask, priority: priority.id })}
                                    className={`
                                      px-3 py-2 rounded-lg flex items-center gap-2 transition-all duration-200
                                      ${priority.color}
                                      ${newTask.priority === priority.id 
                                        ? 'ring-2 ring-offset-2 ring-indigo-500 scale-105' 
                                        : 'hover:scale-105'
                                      }
                                    `}
                                  >
                                    <priority.icon className="w-4 h-4" />
                                    <span>{priority.label}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="mt-6 pt-4 border-t dark:border-gray-700 flex justify-end gap-3">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setNewTask({
                                  title: '',
                                  description: '',
                                  assignedTo: '',
                                  dueDate: '',
                                  priority: 'medium',
                                  department: '',
                                });
                                setShowDialog(false);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleCreateTask}
                              disabled={!newTask.title || !newTask.assignedTo}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                              Create Task
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {/* Tasks Container */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {tasks[column.id].map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`
                              group relative rounded-lg p-4 bg-white dark:bg-gray-800
                              border border-gray-200 dark:border-gray-700
                              ${snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-500' : 'shadow-sm hover:shadow-md'}
                              transition-all duration-200 ease-in-out
                              hover:translate-y-[-2px]
                            `}
                          >
                            {/* Task Menu */}
                            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => setActiveTaskMenu(task._id)}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                              {activeTaskMenu === task._id && (
                                <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 overflow-hidden">
                                  <button
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={() => {/* Implement edit */}}
                                  >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                  </button>
                                  <button
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    onClick={() => handleDeleteTask(column.id, task._id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Task Content */}
                            <div className="pr-8">
                              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                            </div>

                            {/* Task Metadata */}
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                              {task.assignedTo && (
                                <div className="flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-gray-700 dark:text-gray-300">
                                  <User2 className="w-3 h-3" />
                                  <span>{task.assignedTo.name || 'Assigned User'}</span>
                                </div>
                              )}

                              {task.dueDate && (
                                <div className="flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-gray-700 dark:text-gray-300">
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                </div>
                              )}

                              <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
                                priorities.find(p => p.id === task.priority)?.color
                              }`}>
                                {(() => {
                                  const PriorityIcon = priorities.find(p => p.id === task.priority)?.icon;
                                  return PriorityIcon ? <PriorityIcon className="w-3 h-3" /> : null;
                                })()}
                                <span>{priorities.find(p => p.id === task.priority)?.label}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}