import React, { useState, useEffect } from "react";
import {Input} from "../ui/Input";
import {Button} from "../ui/Button";
import { toast } from "sonner";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format, isWithinInterval, parseISO } from "date-fns";

const ENTITY_TAX_RATES = {
  normal: 0.25,
  bank: 0.30,
  special: 0.20,
};

const getFiscalQuarters = () => {
  const year = new Date().getFullYear();
  return [
    new Date(`${year}-01-15`),
    new Date(`${year}-04-15`),
    new Date(`${year}-07-15`),
    new Date(`${year}-10-15`),
  ];
};

const calculateTax = ({ income, isSmallBusiness, region, entityType }) => {
  if (isSmallBusiness) {
    switch (region) {
      case "metro":
        return 7500;
      case "municipality":
        return 5000;
      case "rural":
        return 2500;
      default:
        return 0;
    }
  } else {
    const rate = ENTITY_TAX_RATES[entityType] ?? 0.25;
    return income * rate;
  }
};

export default function Compliance({ addAlert }) {
  const [income, setIncome] = useState("");
  const [isSmallBusiness, setIsSmallBusiness] = useState(false);
  const [region, setRegion] = useState("metro");
  const [entityType, setEntityType] = useState("normal");
  const [taxDue, setTaxDue] = useState(null);
  const [taxHistory, setTaxHistory] = useState([]);

  // Filter/search states
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("taxHistory");
    if (saved) setTaxHistory(JSON.parse(saved));

    const today = new Date();
    const upcoming = getFiscalQuarters().find(
      (date) => date > today && (date - today) / (1000 * 60 * 60 * 24) <= 7
    );
    if (upcoming) {
      const message = `Tax payment due soon on ${format(upcoming, "PPP")}`;
      toast.warning(message);
      if (addAlert) addAlert(message);
    }
  }, [addAlert]);

  // Save history on change
  useEffect(() => {
    localStorage.setItem("taxHistory", JSON.stringify(taxHistory));
  }, [taxHistory]);

  const handleCalculate = () => {
    const incomeVal = parseFloat(income);
    if (isNaN(incomeVal) || incomeVal < 0) {
      toast.error("Please enter a valid income.");
      return;
    }

    const tax = calculateTax({
      income: incomeVal,
      isSmallBusiness,
      region,
      entityType,
    });

    const record = {
      id: Date.now(),
      date: new Date(),
      income: incomeVal,
      tax,
      type: isSmallBusiness
        ? `Small Business (${region})`
        : `Entity Type: ${entityType}`,
    };

    setTaxDue(tax);
    setTaxHistory((prev) => [record, ...prev]);
    toast.success(`Tax calculated: NPR ${tax.toFixed(2)}`);
  };

  const downloadCSV = () => {
    const headers = "Date,Type,Income,Tax\n";
    const rows = filteredHistory
      .map(
        (entry) =>
          `${format(new Date(entry.date), "PPP")},${entry.type},${entry.income},${entry.tax.toFixed(2)}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "tax_history.csv";
    link.click();
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Tax History Report", 14, 16);
    doc.autoTable({
      startY: 20,
      head: [["Date", "Type", "Income", "Tax"]],
      body: filteredHistory.map((entry) => [
        format(new Date(entry.date), "PPP"),
        entry.type,
        entry.income,
        entry.tax.toFixed(2),
      ]),
    });
    doc.save("tax_history.pdf");
  };

  // Filtered History
  const filteredHistory = taxHistory.filter((entry) => {
    const matchesSearch =
      entry.type.toLowerCase().includes(search.toLowerCase()) ||
      entry.income.toString().includes(search);

    const inDateRange =
      !startDate ||
      !endDate ||
      isWithinInterval(parseISO(entry.date), {
        start: new Date(startDate),
        end: new Date(endDate),
      });

    return matchesSearch && inDateRange;
  });

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="border rounded-2xl p-6 shadow-md bg-white space-y-4">
        <h2 className="text-xl font-bold">Nepali Business Tax Calculator</h2>

        <div className="space-y-2">
          <label className="text-sm font-medium">Annual Income (NPR):</label>
          <Input
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="Enter your income"
          />

          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={isSmallBusiness}
              onChange={() => setIsSmallBusiness((prev) => !prev)}
            />
            <span>Small Business (Turnover ≤ 2,000,000)</span>
          </label>

          {isSmallBusiness ? (
            <>
              <label className="block text-sm font-medium">Business Location:</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="border rounded p-2"
              >
                <option value="metro">Metropolitan</option>
                <option value="municipality">Municipality</option>
                <option value="rural">Rural</option>
              </select>
            </>
          ) : (
            <>
              <label className="block text-sm font-medium">Entity Type:</label>
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
                className="border rounded p-2"
              >
                <option value="normal">Normal/Life Insurance (25%)</option>
                <option value="bank">Bank, Insurance, Petroleum (30%)</option>
                <option value="special">Special Industry / BOOT Infra (20%)</option>
              </select>
            </>
          )}

          <Button onClick={handleCalculate}>Calculate Tax</Button>

          {taxDue !== null && (
            <div className="text-green-600 font-medium">
              Tax Due: NPR {taxDue.toFixed(2)}
            </div>
          )}
        </div>
      </div>

      <div className="border rounded-2xl p-6 shadow-md bg-white">
        <h2 className="text-xl font-bold mb-4">Tax History</h2>

        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Search by type or income"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={downloadCSV}>Download CSV</Button>
          <Button onClick={downloadPDF}>Download PDF</Button>
        </div>

        {filteredHistory.length === 0 ? (
          <p className="text-sm text-gray-500 mt-4">No tax history found.</p>
        ) : (
          <ul className="space-y-2 mt-4">
            {filteredHistory.map((entry) => (
              <li key={entry.id} className="border p-3 rounded-xl shadow-sm bg-gray-50">
                <div className="flex justify-between">
                  <span>{format(new Date(entry.date), "PPP")}</span>
                  <span className="font-medium">NPR {entry.tax.toFixed(2)}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {entry.type} | Income: NPR {entry.income}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
