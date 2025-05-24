import React, { useState } from 'react';
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

const initialColumns = {
  todo: {
    id: 'todo',
    title: 'To Do',
    color: 'bg-rose-50/50 dark:bg-rose-900/20',
    borderColor: 'border-rose-200/50 dark:border-rose-800/30',
    textColor: 'text-rose-600 dark:text-rose-400',
    hoverColor: 'hover:bg-rose-100/50 dark:hover:bg-rose-900/30',
  },
  inProgress: {
    id: 'inProgress',
    title: 'In Progress',
    color: 'bg-amber-50/50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200/50 dark:border-amber-800/30',
    textColor: 'text-amber-600 dark:text-amber-400',
    hoverColor: 'hover:bg-amber-100/50 dark:hover:bg-amber-900/30',
  },
  completed: {
    id: 'completed',
    title: 'Completed',
    color: 'bg-emerald-50/50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-200/50 dark:border-emerald-800/30',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    hoverColor: 'hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30',
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
    assignee: '',
    dueDate: '',
    priority: 'medium',
    attachments: [],
  });
  
  const [activeColumn, setActiveColumn] = useState(null);
  const [activeTaskMenu, setActiveTaskMenu] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateTask = () => {
    if (!activeColumn || !newTask.title) return;
    
    setIsLoading(true);
    const task = {
      id: Date.now().toString(),
      ...newTask,
      createdAt: new Date().toISOString(),
      status: activeColumn,
    };

    // Simulate API call
    setTimeout(() => {
      setTasks(prev => ({
        ...prev,
        [activeColumn]: [...prev[activeColumn], task],
      }));
      setNewTask({
        title: '',
        description: '',
        assignee: '',
        dueDate: '',
        priority: 'medium',
        attachments: [],
      });
      setIsLoading(false);
    }, 500);
  };

  const handleDeleteTask = (columnId, taskId) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setTasks(prev => ({
        ...prev,
        [columnId]: prev[columnId].filter(task => task.id !== taskId),
      }));
      setActiveTaskMenu(null);
      setIsLoading(false);
    }, 300);
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    setIsLoading(true);
    const sourceCol = [...tasks[source.droppableId]];
    const destCol = [...tasks[destination.droppableId]];
    const [movedTask] = sourceCol.splice(source.index, 1);

    // Simulate API call
    setTimeout(() => {
      if (source.droppableId === destination.droppableId) {
        sourceCol.splice(destination.index, 0, movedTask);
        setTasks(prev => ({
          ...prev,
          [source.droppableId]: sourceCol,
        }));
      } else {
        destCol.splice(destination.index, 0, { ...movedTask, status: destination.droppableId });
        setTasks(prev => ({
          ...prev,
          [source.droppableId]: sourceCol,
          [destination.droppableId]: destCol,
        }));
      }
      setIsLoading(false);
    }, 300);
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.values(initialColumns).map((column) => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`
                    rounded-xl border bg-white dark:bg-gray-800/50
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
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {column.title}
                        </h3>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                          {tasks[column.id].length}
                        </span>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`${column.hoverColor} transition-colors duration-200`}
                            onClick={() => setActiveColumn(column.id)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Create New Task</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div>
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                Task Title
                              </label>
                              <Input
                                placeholder="Enter task title"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                className="focus:ring-2 focus:ring-indigo-500/20"
                              />
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                Description
                              </label>
                              <textarea
                                placeholder="Enter task description"
                                className="w-full min-h-[100px] rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                Assignee
                              </label>
                              <Input
                                placeholder="Enter assignee name"
                                value={newTask.assignee}
                                onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                                className="focus:ring-2 focus:ring-indigo-500/20"
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                Due Date
                              </label>
                              <Input
                                type="date"
                                value={newTask.dueDate}
                                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                className="focus:ring-2 focus:ring-indigo-500/20"
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                Priority
                              </label>
                              <select
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                value={newTask.priority}
                                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                              >
                                {priorities.map(priority => (
                                  <option key={priority.id} value={priority.id}>
                                    {priority.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <Button 
                              onClick={handleCreateTask} 
                              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : null}
                              Create Task
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className="p-4 space-y-3 min-h-[200px]">
                    {tasks[column.id].map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`
                              relative group rounded-lg p-4 border
                              ${snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-500/20' : 'shadow-sm hover:shadow-md'}
                              ${column.borderColor} ${column.color}
                              transition-all duration-200 ease-in-out
                              hover:scale-[1.02] cursor-grab active:cursor-grabbing
                            `}
                          >
                            {/* Task Menu */}
                            <div className="absolute right-2 top-2">
                              <div className="relative">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                  onClick={() => setActiveTaskMenu(task.id)}
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                                {activeTaskMenu === task.id && (
                                  <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                                    <div className="py-1">
                                      <button
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                                        onClick={() => {/* Implement edit */}}
                                      >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                      </button>
                                      <button
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
                                        onClick={() => handleDeleteTask(column.id, task.id)}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Task Content */}
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2 pr-8">
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                {task.description}
                              </p>
                            )}

                            {/* Task Metadata */}
                            <div className="flex flex-wrap gap-2 mt-3">
                              {task.assignee && (
                                <div className="flex items-center gap-1 text-xs bg-gray-100/50 dark:bg-gray-700/50 px-2 py-1 rounded-full border border-gray-200/50 dark:border-gray-600/50">
                                  <User2 className="w-3 h-3" />
                                  <span>{task.assignee}</span>
                                </div>
                              )}
                              
                              {task.dueDate && (
                                <div className="flex items-center gap-1 text-xs bg-gray-100/50 dark:bg-gray-700/50 px-2 py-1 rounded-full border border-gray-200/50 dark:border-gray-600/50">
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                </div>
                              )}

                              <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
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
