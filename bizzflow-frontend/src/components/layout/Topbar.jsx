import React, { useState, useRef, useEffect } from "react";
import { Bell, UserCircle } from "lucide-react";

export function Topbar({ alerts = [] }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white dark:bg-gray-800 shadow flex justify-between items-center px-6 py-4 relative">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Dashboard</h2>
      <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown((prev) => !prev)}
          className="relative text-gray-500 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
        >
          <Bell className="w-5 h-5" />
          {alerts.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              {alerts.length}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute right-10 top-12 w-64 max-h-80 overflow-y-auto bg-white dark:bg-gray-700 shadow-xl border rounded-xl z-50 p-3">
            <h4 className="text-sm font-semibold mb-2 text-gray-800 dark:text-white">Notifications</h4>
            {alerts.length === 0 ? (
              <p className="text-sm text-gray-500">No new notifications.</p>
            ) : (
              <ul className="space-y-2">
                {alerts.map((alert, idx) => (
                  <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 border-b pb-1">
                    {alert}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex items-center space-x-2">
          <UserCircle className="w-6 h-6 text-gray-700 dark:text-white" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Admin</span>
        </div>
      </div>
    </header>
  );
}
