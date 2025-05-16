import {
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
    PieChart, Pie, Cell
  } from 'recharts';
  
  const lineData = [
    { month: 'Jan', payments: 120000 },
    { month: 'Feb', payments: 95000 },
    { month: 'Mar', payments: 145000 },
    { month: 'Apr', payments: 130000 },
  ];
  
  const pieData = [
    { name: 'Completed', value: 20 },
    { name: 'In Progress', value: 10 },
    { name: 'Pending', value: 5 },
  ];
  
  const COLORS = ['#16a34a', '#facc15', '#ef4444'];
  
  export default function Dashboard() {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 col-span-full">
          <Card title="Total Tasks" value="35" />
          <Card title="Pending Payments" value="NPR 56,000" />
          <Card title="Employees" value="12" />
          <Card title="Upcoming Deadlines" value="3" />
        </div>
  
        {/* Line Chart: Monthly Payments */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow col-span-1">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Monthly Payments</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="payments" stroke="#1D4ED8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
  
        {/* Pie Chart: Task Status */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow col-span-1">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Task Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
  
  
  function Card({ title, value }) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow flex flex-col items-center justify-center">
        <h4 className="text-sm text-gray-500 dark:text-gray-300">{title}</h4>
        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{value}</span>
      </div>
    );
  }
  