import { Bell, UserCircle } from 'lucide-react';

export function Topbar() {
  return (
    <header className="bg-white dark:bg-gray-800 shadow flex justify-between items-center px-6 py-4">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Dashboard</h2>
      <div className="flex items-center space-x-4">
        <button className="text-gray-500 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
          <Bell className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-2">
          <UserCircle className="w-6 h-6 text-gray-700 dark:text-white" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Admin</span>
        </div>
      </div>
    </header>
  );
}
