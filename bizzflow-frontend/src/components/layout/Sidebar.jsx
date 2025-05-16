import { Home, ClipboardList, Banknote, ShieldCheck, Users, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const navItems = [
  { name: 'Dashboard', icon: Home, path: '/' },
  { name: 'Tasks', icon: ClipboardList, path: '/tasks' },
  { name: 'Payroll', icon: Banknote, path: '/payroll' },
  { name: 'Compliance', icon: ShieldCheck, path: '/compliance' },
  { name: 'Vendors', icon: Users, path: '/vendors' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-md h-screen p-4 hidden md:block">
      <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">BizFlow Nepal</h1>
      <nav className="space-y-2">
        {navItems.map(({ name, icon: Icon, path }) => (
          <Link
            key={name}
            to={path}
            className="flex items-center space-x-3 p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-700 dark:text-white"
          >
            <Icon className="w-5 h-5" />
            <span>{name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
