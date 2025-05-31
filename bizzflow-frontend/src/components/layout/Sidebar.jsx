// src/components/layout/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ListChecks,
  Briefcase,
  ShieldCheck,
  Users,
  Settings,
  FileText,
  PieChart,
  Bell,
  Trash2,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Define navigation items with role-based access
const navigationConfig = [
  { 
    name: 'Dashboard', 
    icon: LayoutDashboard, 
    path: '/',
    allowedRoles: ['admin', 'manager', 'employee'] 
  },
  { 
    name: 'Tasks', 
    icon: ListChecks, 
    path: '/tasks',
    allowedRoles: ['admin', 'manager', 'employee'] 
  },
  { 
    name: 'Payroll', 
    icon: Briefcase, 
    path: '/payroll',
    allowedRoles: ['admin', 'manager'] 
  },
  { 
    name: 'Attendance', 
    icon: Clock, 
    path: '/attendance',
    allowedRoles: ['admin', 'manager', 'employee'] 
  },
  { 
    name: 'Compliance', 
    icon: ShieldCheck, 
    path: '/compliance',
    allowedRoles: ['admin', 'manager'] 
  },
  { 
    name: 'Vendors', 
    icon: Users, 
    path: '/vendors',
    allowedRoles: ['admin', 'manager'] 
  },
  { 
    name: 'Trash', 
    icon: Trash2, 
    path: '/trash',
    allowedRoles: ['admin'] 
  },
  { 
    name: 'Settings', 
    icon: Settings, 
    path: '/settings',
    allowedRoles: ['admin'] 
  },
];

export const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isActive = (path) => location.pathname === path;

  // Get user initials
  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase() || '';
  };

  // Filter navigation items based on user role
  const filteredNavigation = navigationConfig.filter(item => 
    item.allowedRoles.includes(user?.role || '')
  );

  return (
    <aside className="h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">B</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            BizFlow
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {filteredNavigation.map((item) => {
            const isCurrentPath = isActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  isCurrentPath
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${
                    isCurrentPath
                      ? 'text-indigo-600 dark:text-indigo-300'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile Section */}
      {user && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
              <span className="text-indigo-600 dark:text-indigo-300 font-medium text-sm">
                {getInitials(user.name)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-1">
                {user.role}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
