import React, { useState } from 'react';
import axios from 'axios';
import NepaliDate from 'nepali-date-converter';
import { ad2bs } from 'ad-bs-converter';
import {
    Calculator,
    FileText,
    CreditCard,
    AlertCircle,
    CheckCircle2,
    Building2,
    Receipt,
    History,
    Loader2,
} from 'lucide-react';
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

const businessTypes = [
    { id: 'private_limited', label: 'Private Limited Company', rate: 25 },
    { id: 'public_limited', label: 'Public Limited Company', rate: 30 },
    { id: 'foreign', label: 'Foreign Company', rate: 35 },
    { id: 'small_business', label: 'Small Business', rate: 15 },
];

const registrationTypes = [
    { id: 'pan', label: 'PAN', description: 'Permanent Account Number' },
    { id: 'vat', label: 'VAT', description: 'Value Added Tax' },
];

const paymentMethods = [
    { id: 'esewa', label: 'eSewa', icon: '💳' },
    { id: 'khalti', label: 'Khalti', icon: '💰' },
];

// Business tax rates in Nepal (FY 2080/81)
const TAX_RATES = {
    private_limited: 0.25, // 25% for private limited companies
    public_limited: 0.30,  // 30% for public limited companies
    foreign: 0.35,         // 35% for foreign companies
    small_business: 0.15   // 15% for small businesses
};

// VAT threshold and rate
const VAT_THRESHOLD = 5000000; // 50 Lakhs
const VAT_RATE = 0.13; // 13%

// Convert AD date to BS using NepaliDate
const convertToBS = (adDate) => {
    try {
        // Handle ISO string date
        let date;
        if (typeof adDate === 'string') {
            date = new Date(adDate);
        } else if (adDate instanceof Date) {
            date = adDate;
        } else {
            console.error('Invalid date input:', adDate);
            return 'Invalid Date';
        }

        if (isNaN(date.getTime())) {
            console.error('Invalid date value:', adDate);
            return 'Invalid Date';
        }

        // Use NepaliDate for conversion
        const nepaliDate = new NepaliDate(date);
        const year = nepaliDate.getYear();
        const month = nepaliDate.getMonth() + 1; // NepaliDate months are 0-based
        const day = nepaliDate.getDate();

        // Format the date
        return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
    } catch (error) {
        console.error('Date conversion error:', error);
        return 'Conversion error';
    }
};

const Compliance = () => {
    const [businessData, setBusinessData] = useState({
        annualRevenue: '',
        businessType: 'private_limited',
        registrationType: 'pan',
        panNumber: '',
        vatNumber: '',
        fiscalYear: new Date().getFullYear(),
        deductions: '',
        expenses: ''
    });

    const [taxHistory, setTaxHistory] = useState([]);
    const [calculatedTax, setCalculatedTax] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState('calculator');

    // Calculate taxable income
    const calculateTaxableIncome = () => {
        const revenue = parseFloat(businessData.annualRevenue) || 0;
        const deductions = parseFloat(businessData.deductions) || 0;
        const expenses = parseFloat(businessData.expenses) || 0;
        return revenue - deductions - expenses;
    };

    // Calculate tax
    const calculateTax = () => {
        const taxableIncome = calculateTaxableIncome();
        const taxRate = TAX_RATES[businessData.businessType];
        const tax = taxableIncome * taxRate;
        
        // Calculate VAT if applicable
        const vatAmount = businessData.registrationType === 'vat' && taxableIncome > VAT_THRESHOLD 
            ? taxableIncome * VAT_RATE 
            : 0;

        setCalculatedTax({
            taxableIncome,
            taxRate: taxRate * 100,
            totalTax: tax,
            vatAmount,
            fiscalYear: businessData.fiscalYear,
            registrationType: businessData.registrationType,
            registrationNumber: businessData.registrationType === 'pan' ? businessData.panNumber : businessData.vatNumber
        });

        // Add to tax history with properly formatted date
        const historyEntry = {
            date: new Date().toISOString(), // Store as ISO string
            fiscalYear: businessData.fiscalYear,
            taxableIncome,
            taxRate: taxRate * 100,
            totalTax: tax,
            vatAmount,
            status: 'Calculated',
            registrationType: businessData.registrationType,
            registrationNumber: businessData.registrationType === 'pan' ? businessData.panNumber : businessData.vatNumber
        };

        setTaxHistory(prev => [historyEntry, ...prev]);
    };

    // Handle payment integration
    const handlePayment = async () => {
        if (!calculatedTax) return;

        setLoading(true);
        try {
            // Example integration with eSewa/Khalti
            const paymentData = {
                amount: calculatedTax.totalTax,
                productName: `Tax Payment FY ${calculatedTax.fiscalYear}`,
                paymentMethod: paymentMethod
            };

            // This would be replaced with actual eSewa/Khalti API integration
            const response = await mockPaymentAPI(paymentData);

            if (response.success) {
                // Update tax history with payment status
                setTaxHistory(prev => prev.map((entry, index) => 
                    index === 0 ? { ...entry, status: 'Paid', paymentMethod } : entry
                ));
            }
        } catch (error) {
            console.error('Payment failed:', error);
        } finally {
            setLoading(false);
        }
    };

    // Mock payment API (replace with actual eSewa/Khalti integration)
    const mockPaymentAPI = async (data) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, message: 'Payment successful' });
            }, 2000);
        });
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 py-8 px-4 sm:px-6 lg:px-8 font-sans antialiased">
            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-black/20 dark:bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl flex items-center gap-3">
                        <Loader2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-spin" />
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Processing...</p>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                            <Receipt className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                                Tax Compliance
                            </h1>
                            <p className="text-base text-gray-600 dark:text-gray-300 mt-2 font-medium">
                                Calculate and manage your business tax obligations with ease
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex space-x-1 rounded-xl bg-white dark:bg-gray-800 p-1 mb-8 shadow-sm border border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveSection('calculator')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200
                            ${activeSection === 'calculator' 
                                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm' 
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                    >
                        <Calculator className="w-4 h-4" />
                        Calculator
                    </button>
                    <button
                        onClick={() => setActiveSection('history')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200
                            ${activeSection === 'history' 
                                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm' 
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                    >
                        <History className="w-4 h-4" />
                        History
                    </button>
                </div>

                {activeSection === 'calculator' ? (
                    <>
                        {/* Tax Rates Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                                    <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Current Tax Rates
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                                        Fiscal Year 2080/81
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {businessTypes.map(type => (
                                    <div 
                                        key={type.id}
                                        className="relative p-4 rounded-lg bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-750 border border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-colors group"
                                    >
                                        <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                            {type.label}
                                        </div>
                                        <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                                            {type.rate}%
                                        </div>
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                                                <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Calculator Form */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                                    <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Tax Calculator
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                                        Enter your business details to calculate tax
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                            Registration Type
                                        </label>
                                        <select
                                            value={businessData.registrationType}
                                            onChange={(e) => setBusinessData({...businessData, registrationType: e.target.value})}
                                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                                        >
                                            {registrationTypes.map(type => (
                                                <option key={type.id} value={type.id}>
                                                    {type.label} - {type.description}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                            {businessData.registrationType === 'pan' ? 'PAN Number' : 'VAT Number'}
                                        </label>
                                        <Input
                                            type="text"
                                            value={businessData.registrationType === 'pan' ? businessData.panNumber : businessData.vatNumber}
                                            onChange={(e) => setBusinessData({
                                                ...businessData,
                                                [businessData.registrationType === 'pan' ? 'panNumber' : 'vatNumber']: e.target.value
                                            })}
                                            className="w-full font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                            placeholder={`Enter your ${businessData.registrationType.toUpperCase()} number`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                            Business Type
                                        </label>
                                        <select
                                            value={businessData.businessType}
                                            onChange={(e) => setBusinessData({...businessData, businessType: e.target.value})}
                                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                                        >
                                            {businessTypes.map(type => (
                                                <option key={type.id} value={type.id}>
                                                    {type.label} ({type.rate}%)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                            Annual Revenue (NPR)
                                        </label>
                                        <Input
                                            type="number"
                                            value={businessData.annualRevenue}
                                            onChange={(e) => setBusinessData({...businessData, annualRevenue: e.target.value})}
                                            className="w-full font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                            placeholder="Enter annual revenue"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                            Deductions (NPR)
                                        </label>
                                        <Input
                                            type="number"
                                            value={businessData.deductions}
                                            onChange={(e) => setBusinessData({...businessData, deductions: e.target.value})}
                                            className="w-full font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                            placeholder="Enter deductions"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                            Expenses (NPR)
                                        </label>
                                        <Input
                                            type="number"
                                            value={businessData.expenses}
                                            onChange={(e) => setBusinessData({...businessData, expenses: e.target.value})}
                                            className="w-full font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                            placeholder="Enter expenses"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-center">
                                <Button
                                    onClick={calculateTax}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-base font-semibold px-10 py-2.5 shadow-sm"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                            Calculating...
                                        </>
                                    ) : (
                                        <>
                                            <Calculator className="w-5 h-5 mr-2" />
                                            Calculate Tax
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Results Section */}
                        {calculatedTax && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                                        <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            Calculation Results
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                                            Tax calculation summary for your business
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700">
                                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            Fiscal Year
                                        </div>
                                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                                            {calculatedTax.fiscalYear}
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700">
                                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            Registration
                                        </div>
                                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                                            {calculatedTax.registrationType.toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700">
                                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            Tax Rate
                                        </div>
                                        <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                            {calculatedTax.taxRate}%
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700">
                                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            Taxable Income
                                        </div>
                                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                                            NPR {calculatedTax.taxableIncome.toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                                    <div className="p-6 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/30 border border-indigo-200 dark:border-indigo-800/30">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-800/50 rounded-full">
                                                <Receipt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                                Income Tax Amount
                                            </div>
                                        </div>
                                        <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                                            NPR {calculatedTax.totalTax.toLocaleString()}
                                        </div>
                                    </div>
                                    {calculatedTax.vatAmount > 0 && (
                                        <div className="p-6 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 border border-purple-200 dark:border-purple-800/30">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="p-1.5 bg-purple-100 dark:bg-purple-800/50 rounded-full">
                                                    <Receipt className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                </div>
                                                <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                                    VAT Amount (13%)
                                                </div>
                                            </div>
                                            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                                                NPR {calculatedTax.vatAmount.toLocaleString()}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                                            <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Payment Method
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                                                Choose your preferred payment method
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <select
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
                                        >
                                            <option value="">Select Payment Method</option>
                                            {paymentMethods.map(method => (
                                                <option key={method.id} value={method.id}>
                                                    {method.icon} {method.label}
                                                </option>
                                            ))}
                                        </select>
                                        <Button
                                            onClick={handlePayment}
                                            disabled={!paymentMethod || loading}
                                            className={!paymentMethod || loading 
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-green-600 hover:bg-green-700 text-white font-semibold'
                                            }
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="w-5 h-5 mr-2" />
                                                    Pay Now
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Tax History
                                </h2>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Date (BS)
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Registration
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Taxable Income
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Tax Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            VAT Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {taxHistory.map((entry, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/50'}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                {convertToBS(entry.date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                {entry.registrationType.toUpperCase()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                {entry.registrationNumber}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                NPR {entry.taxableIncome.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                                NPR {entry.totalTax.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                                NPR {entry.vatAmount ? entry.vatAmount.toLocaleString() : '0'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                                                    ${entry.status === 'Paid' 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                    }`}
                                                >
                                                    {entry.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Compliance; 