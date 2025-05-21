import React, { useState } from "react";
import {
  UserCircle,
  CalendarCheck2,
  FileText,
  BadgeDollarSign,
  Download,
  PlusCircle,
  MinusCircle,
} from "lucide-react";
import { Button } from "../ui/Button";
import StatCard from "../ui/Statcard";

const mockEmployee = {
  name: "Aayush Shrestha",
  role: "Software Engineer",
  salary: 80000,
  pan: "PAN1234567",
  workingDays: 22,
  leaves: 2,
  bonuses: 5000,
  deductions: 3000,
};

const Payroll = () => {
  const [employee] = useState(mockEmployee);

  const calculateNetSalary = () => {
    const perDaySalary = employee.salary / 26;
    const salaryAfterLeaves = perDaySalary * (employee.workingDays - employee.leaves);
    return salaryAfterLeaves + employee.bonuses - employee.deductions;
  };

  const netSalary = calculateNetSalary();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-white text-3xl font-bold mb-4">Payroll & Attendance</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow space-y-6">
        <div className="flex items-center space-x-4">
          <UserCircle className="w-10 h-10 text-blue-600" />
          <div>
            <p className="text-white text-lg font-semibold">{employee.name}</p>
            <p className="text-sm text-gray-500">{employee.role}</p>
            <p className="text-sm text-gray-500">PAN: {employee.pan}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard title="Working Days" value={employee.workingDays} />
          <StatCard title="Leaves" value={employee.leaves} />
          <StatCard title="Bonuses" value={`Rs. ${employee.bonuses}`} />
          <StatCard title="Deductions" value={`Rs. ${employee.deductions}`} />
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center gap-2 text-xl font-bold">
            <BadgeDollarSign className="text-yellow-600" />
            <div className="text-white">Net Salary: Rs. {netSalary.toFixed(2)}</div> 
          </div>
        </div>

        <div className="pt-4">
          <Button className="flex items-center gap-2">
            <FileText className="w- h-4" /> 
            <div className="">Generate Pay Slip</div>
          </Button>
          <Button variant="outline" className="ml-4 flex items-center gap-2">
            <Download className="w-4 h-4" /> Export PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Payroll;
