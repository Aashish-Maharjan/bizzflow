import React, { useState } from 'react';
import axios from 'axios';
import NepaliDate from 'nepali-date-converter';
import { ad2bs } from 'ad-bs-converter';

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

    // Convert AD date to BS
    const convertToBS = (adDate) => {
        try {
            const date = new Date(adDate);
            if (isNaN(date.getTime())) {
                return 'Invalid Date';
            }
            const year = date.getFullYear();
            const month = date.getMonth() + 1; // JavaScript months are 0-based
            const day = date.getDate();
            
            const bsDate = ad2bs(year, month, day);
            return `${bsDate.en.year}/${String(bsDate.en.month).padStart(2, '0')}/${String(bsDate.en.day).padStart(2, '0')}`;
        } catch (error) {
            console.error('Date conversion error:', error);
            return 'Date conversion error';
        }
    };

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

        // Add to tax history
        const historyEntry = {
            date: new Date().toISOString(),
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
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
                    Business Tax Calculator
                </h1>
                
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Tax Rates (FY 2080/81)</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tax Rate</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Additional Information</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr>
                                    <td className="px-6 py-4 text-sm text-gray-900">Private Limited Company</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">25%</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">Standard rate for private companies</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-sm text-gray-900">Public Limited Company</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">30%</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">Listed companies</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-sm text-gray-900">Foreign Company</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">35%</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">Non-resident companies</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-sm text-gray-900">Small Business</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">15%</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">Annual turnover below 50 Lakhs</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-sm text-gray-900">VAT</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">13%</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">Applicable above 50 Lakhs turnover</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="block">
                                <span className="text-gray-700">Registration Type</span>
                                <select
                                    value={businessData.registrationType}
                                    onChange={(e) => setBusinessData({...businessData, registrationType: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="pan">PAN</option>
                                    <option value="vat">VAT</option>
                                </select>
                            </label>

                            <label className="block">
                                <span className="text-gray-700">
                                    {businessData.registrationType === 'pan' ? 'PAN Number' : 'VAT Number'}
                                </span>
                                <input
                                    type="text"
                                    value={businessData.registrationType === 'pan' ? businessData.panNumber : businessData.vatNumber}
                                    onChange={(e) => setBusinessData({
                                        ...businessData,
                                        [businessData.registrationType === 'pan' ? 'panNumber' : 'vatNumber']: e.target.value
                                    })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </label>

                            <label className="block">
                                <span className="text-gray-700">Annual Revenue (NPR)</span>
                                <input
                                    type="number"
                                    value={businessData.annualRevenue}
                                    onChange={(e) => setBusinessData({...businessData, annualRevenue: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </label>

                            <label className="block">
                                <span className="text-gray-700">Business Type</span>
                                <select
                                    value={businessData.businessType}
                                    onChange={(e) => setBusinessData({...businessData, businessType: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="private_limited">Private Limited Company</option>
                                    <option value="public_limited">Public Limited Company</option>
                                    <option value="foreign">Foreign Company</option>
                                    <option value="small_business">Small Business</option>
                                </select>
                            </label>
                        </div>

                        <div className="space-y-4">
                            <label className="block">
                                <span className="text-gray-700">Deductions (NPR)</span>
                                <input
                                    type="number"
                                    value={businessData.deductions}
                                    onChange={(e) => setBusinessData({...businessData, deductions: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </label>

                            <label className="block">
                                <span className="text-gray-700">Expenses (NPR)</span>
                                <input
                                    type="number"
                                    value={businessData.expenses}
                                    onChange={(e) => setBusinessData({...businessData, expenses: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <button 
                            onClick={calculateTax}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Calculate Tax
                        </button>
                    </div>
                </div>

                {calculatedTax && (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tax Calculation Results</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500">Fiscal Year</p>
                                <p className="text-lg font-medium">{calculatedTax.fiscalYear}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500">Registration Type</p>
                                <p className="text-lg font-medium">{calculatedTax.registrationType.toUpperCase()}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500">Registration Number</p>
                                <p className="text-lg font-medium">{calculatedTax.registrationNumber}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500">Taxable Income</p>
                                <p className="text-lg font-medium">NPR {calculatedTax.taxableIncome.toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500">Tax Rate</p>
                                <p className="text-lg font-medium">{calculatedTax.taxRate}%</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500">Income Tax Amount</p>
                                <p className="text-lg font-medium text-indigo-600">NPR {calculatedTax.totalTax.toLocaleString()}</p>
                            </div>
                            {calculatedTax.vatAmount > 0 && (
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500">VAT Amount (13%)</p>
                                    <p className="text-lg font-medium text-indigo-600">NPR {calculatedTax.vatAmount.toLocaleString()}</p>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Pay Tax</h3>
                            <div className="flex items-center space-x-4">
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">Select Payment Method</option>
                                    <option value="esewa">eSewa</option>
                                    <option value="khalti">Khalti</option>
                                </select>
                                <button 
                                    onClick={handlePayment}
                                    disabled={!paymentMethod || loading}
                                    className={`inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white 
                                        ${!paymentMethod || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'}`}
                                >
                                    {loading ? 'Processing...' : 'Pay Now'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-2xl font-semibold text-gray-900">Tax History</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date (BS)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taxable Income</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VAT Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {taxHistory.map((entry, index) => (
                                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {convertToBS(entry.date)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {entry.registrationType.toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {entry.registrationNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            NPR {entry.taxableIncome.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                                            NPR {entry.totalTax.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                                            NPR {entry.vatAmount ? entry.vatAmount.toLocaleString() : '0'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${entry.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {entry.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Compliance; 