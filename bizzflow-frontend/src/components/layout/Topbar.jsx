import React, { useState, useRef, useEffect } from "react";
import { Bell, UserCircle, LogOut, Settings, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Topbar({ alerts = [] }) {
  const [showAlerts, setShowAlerts] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const alertRef = useRef();
  const adminRef = useRef();
  const navigate = useNavigate();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (alertRef.current && !alertRef.current.contains(event.target)) {
        setShowAlerts(false);
      }
      if (adminRef.current && !adminRef.current.contains(event.target)) {
        setShowAdminMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Clear localStorage/token/etc.
    localStorage.clear();
    navigate("/login");
  };

  const handleChangePassword = () => {
    alert("Redirect to change password page or open modal (not implemented yet)");
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow flex justify-between items-center px-6 py-4 relative">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Dashboard</h2>

      <div className="flex items-center space-x-6 relative">
        {/* Notifications */}
        <div ref={alertRef} className="relative">
          <button
            onClick={() => setShowAlerts((prev) => !prev)}
            className="relative text-gray-500 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
          >
            <Bell className="w-5 h-5" />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {alerts.length}
              </span>
            )}
          </button>

          {showAlerts && (
            <div className="absolute right-0 top-10 w-64 max-h-80 overflow-y-auto bg-white dark:bg-gray-700 shadow-xl border rounded-xl z-50 p-3">
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
        </div>

        {/* Admin Menu */}
        <div ref={adminRef} className="relative">
          <div
            onClick={() => setShowAdminMenu((prev) => !prev)}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <UserCircle className="w-6 h-6 text-gray-700 dark:text-white" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Admin</span>
          </div>

          {showAdminMenu && (
            <div className="absolute right-0 top-10 w-64 bg-white dark:bg-gray-700 shadow-xl border rounded-xl z-50 py-2">
              <div className="px-4 py-2 border-b">
                <p className="text-sm font-semibold text-gray-800 dark:text-white">Admin Name</p>
                <p className="text-xs text-gray-500 dark:text-gray-300">admin@example.com</p>
                <p className="text-xs text-gray-400">Role: Super Admin</p>
              </div>

              <button
                onClick={() => {
                  navigate("/settings");
                  setShowAdminMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
              >
                <Settings  onClick={() => {
                  navigate('/settings');
                  setShowAdminMenu(false);
                }}className="w-4 h-4" /> Settings
              </button>

              <button
                onClick={handleChangePassword}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
              >
                <Key className="w-4 h-4" /> Change Password
              </button>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-800 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
