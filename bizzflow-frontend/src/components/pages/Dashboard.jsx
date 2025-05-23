import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { FiUsers, FiDollarSign, FiCheckSquare, FiClock, FiBell, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import Card from '../ui/Card';

const lineData = [
  { month: 'Jan', revenue: 320000, expenses: 240000 },
  { month: 'Feb', revenue: 280000, expenses: 200000 },
  { month: 'Mar', revenue: 450000, expenses: 320000 },
  { month: 'Apr', revenue: 380000, expenses: 280000 },
  { month: 'May', revenue: 420000, expenses: 300000 },
  { month: 'Jun', revenue: 520000, expenses: 380000 },
];

const pieData = [
  { name: 'Completed', value: 20 },
  { name: 'In Progress', value: 10 },
  { name: 'Pending', value: 5 },
];

const barData = [
  { category: 'Inventory', amount: 150000 },
  { category: 'Services', amount: 280000 },
  { category: 'Equipment', amount: 120000 },
  { category: 'Marketing', amount: 90000 },
];

const COLORS = ['#16a34a', '#facc15', '#ef4444'];
const EXPENSE_CATEGORIES = ['Inventory', 'Services', 'Equipment', 'Marketing', 'Others'];

export default function Dashboard() {
  const recentTransactions = [
    { id: 1, vendor: 'ABC Suppliers', amount: 25000, date: '2024-03-15', status: 'completed' },
    { id: 2, vendor: 'XYZ Services', amount: 18000, date: '2024-03-14', status: 'pending' },
    { id: 3, vendor: 'Tech Solutions', amount: 35000, date: '2024-03-13', status: 'completed' },
    { id: 4, vendor: 'Marketing Pro', amount: 12000, date: '2024-03-12', status: 'pending' },
  ];

  const upcomingPayments = [
    { id: 1, vendor: 'Office Supplies Ltd', amount: 15000, dueDate: '2024-03-20' },
    { id: 2, vendor: 'IT Services Co', amount: 45000, dueDate: '2024-03-22' },
    { id: 3, vendor: 'Maintenance Inc', amount: 8000, dueDate: '2024-03-25' },
  ];

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Top Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
            <FiDollarSign className="h-6 w-6 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">NPR 2.37M</p>
            <div className="flex items-center mt-1">
              <FiTrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-500 ml-1">+12.5%</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex items-center space-x-4">
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
            <FiCheckSquare className="h-6 w-6 text-green-600 dark:text-green-300" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Completed Tasks</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">35</p>
            <div className="flex items-center mt-1">
              <FiTrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-500 ml-1">+8.2%</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex items-center space-x-4">
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
            <FiClock className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pending Payments</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">NPR 156K</p>
            <div className="flex items-center mt-1">
              <FiTrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-500 ml-1">-2.3%</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex items-center space-x-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
            <FiUsers className="h-6 w-6 text-purple-600 dark:text-purple-300" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Active Vendors</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">24</p>
            <div className="flex items-center mt-1">
              <FiTrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-500 ml-1">+4.1%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Revenue vs Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6' }}
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#EF4444" 
                strokeWidth={2}
                dot={{ fill: '#EF4444' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Categories Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Expense Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="category" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
              />
              <Bar dataKey="amount" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Vendor</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b dark:border-gray-700">
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-300">{transaction.vendor}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-300">NPR {transaction.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-300">{new Date(transaction.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${transaction.status === 'completed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        }`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Payments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Upcoming Payments</h3>
          <div className="space-y-4">
            {upcomingPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{payment.vendor}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Due: {new Date(payment.dueDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">NPR {payment.amount.toLocaleString()}</p>
                  <button className="mt-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                    Process Payment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
  
  
  