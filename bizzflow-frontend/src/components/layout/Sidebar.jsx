// src/components/layout/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ListChecks,
  Briefcase,
  ShieldCheck,
  Users,
  Settings,
} from 'lucide-react';

export const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-gray-800 text-white p-4">
      <h1 className="text-2xl font-bold mb-6">BizFlow Nepal</h1>
      <nav className="space-y-4">
        <Link
          to="/"
          className={`flex items-center gap-2 p-2 rounded hover:bg-gray-700 ${
            isActive('/') ? 'bg-gray-700' : ''
          }`}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </Link>
        <Link
          to="/tasks"
          className={`flex items-center gap-2 p-2 rounded hover:bg-gray-700 ${
            isActive('/tasks') ? 'bg-gray-700' : ''
          }`}
        >
          <ListChecks size={18} />
          Tasks
        </Link>
        <Link
          to="/payroll"
          className={`flex items-center gap-2 p-2 rounded hover:bg-gray-700 ${
            isActive('/payroll') ? 'bg-gray-700' : ''
          }`}
        >
          <Briefcase size={18} />
          Payroll
        </Link>
        <Link
          to="/compliance"
          className={`flex items-center gap-2 p-2 rounded hover:bg-gray-700 ${
            isActive('/compliance') ? 'bg-gray-700' : ''
          }`}
        >
          <ShieldCheck size={18} />
          Compliance
        </Link>
        <Link
          to="/vendors"
          className={`flex items-center gap-2 p-2 rounded hover:bg-gray-700 ${
            isActive('/vendors') ? 'bg-gray-700' : ''
          }`}
        >
          <Users size={18} />
          Vendors
        </Link>
        <Link
          to="/settings"
          className={`flex items-center gap-2 p-2 rounded hover:bg-gray-700 ${
            isActive('/settings') ? 'bg-gray-700' : ''
          }`}
        >
          <Settings size={18} />
          Settings
        </Link>
      </nav>
    </aside>
  );
};
