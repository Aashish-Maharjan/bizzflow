import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiDollarSign, FiClock, FiCheckCircle } from 'react-icons/fi';

const Vendors = () => {
    // State management for vendors and related data
    const [vendors, setVendors] = useState([]);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [showPOModal, setShowPOModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');

    // Form states
    const [vendorForm, setVendorForm] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        registrationType: 'pan',
        panNumber: '',
        vatNumber: '',
        category: 'supplier',
        bankDetails: {
            accountName: '',
            accountNumber: '',
            bankName: '',
            branch: ''
        }
    });

    const [poForm, setPOForm] = useState({
        vendorId: '',
        items: [{ description: '', quantity: 1, unitPrice: 0, unit: 'piece' }],
        dueDate: '',
        paymentTerms: '',
        tax: 0,
        discount: 0,
        notes: ''
    });

    // Fetch vendors on component mount
    useEffect(() => {
        fetchVendors();
        fetchPurchaseOrders();
    }, []);

    // API calls
    const fetchVendors = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/vendors');
            setVendors(response.data);
        } catch (error) {
            toast.error('Failed to fetch vendors');
        } finally {
            setLoading(false);
        }
    };

    const fetchPurchaseOrders = async () => {
        try {
            const response = await axios.get('/api/purchase-orders');
            setPurchaseOrders(response.data);
        } catch (error) {
            toast.error('Failed to fetch purchase orders');
        }
    };

    const handleVendorSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (selectedVendor) {
                await axios.put(`/api/vendors/${selectedVendor._id}`, vendorForm);
                toast.success('Vendor updated successfully');
            } else {
                await axios.post('/api/vendors', vendorForm);
                toast.success('Vendor added successfully');
            }
            setShowVendorModal(false);
            fetchVendors();
            resetVendorForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save vendor');
        } finally {
            setLoading(false);
        }
    };

    const handlePOSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const formData = {
                ...poForm,
                items: poForm.items.map(item => ({
                    ...item,
                    quantity: Number(item.quantity),
                    unitPrice: Number(item.unitPrice)
                })),
                tax: Number(poForm.tax),
                discount: Number(poForm.discount)
            };
            
            await axios.post('/api/purchase-orders', formData);
            toast.success('Purchase order created successfully');
            setShowPOModal(false);
            fetchPurchaseOrders();
            resetPOForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create purchase order');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (purchaseOrder) => {
        if (!paymentMethod) {
            toast.error('Please select a payment method');
            return;
        }

        try {
            setLoading(true);
            const paymentData = {
                amount: purchaseOrder.total - purchaseOrder.payments.reduce((sum, p) => sum + p.amount, 0),
                method: paymentMethod,
                reference: `PAY-${Date.now()}`,
                note: `Payment for PO: ${purchaseOrder.orderNumber}`
            };

            await axios.post(`/api/purchase-orders/${purchaseOrder._id}/payments`, paymentData);
            toast.success('Payment processed successfully');
            fetchPurchaseOrders();
            setPaymentMethod('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Payment processing failed');
        } finally {
            setLoading(false);
        }
    };

    const handlePOStatusUpdate = async (purchaseOrder, status) => {
        try {
            setLoading(true);
            await axios.put(`/api/purchase-orders/${purchaseOrder._id}/status`, {
                status,
                note: `PO ${status} by user`
            });
            toast.success(`Purchase order ${status} successfully`);
            fetchPurchaseOrders();
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to ${status} purchase order`);
        } finally {
            setLoading(false);
        }
    };

    // Form handlers
    const handleVendorInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('bankDetails.')) {
            const field = name.split('.')[1];
            setVendorForm(prev => ({
                ...prev,
                bankDetails: {
                    ...prev.bankDetails,
                    [field]: value
                }
            }));
        } else {
            setVendorForm(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handlePOInputChange = (e, index) => {
        const { name, value } = e.target;
        if (name.startsWith('items.')) {
            const field = name.split('.')[1];
            const newItems = [...poForm.items];
            newItems[index] = {
                ...newItems[index],
                [field]: value
            };
            setPOForm(prev => ({
                ...prev,
                items: newItems
            }));
        } else {
            setPOForm(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const addPOItem = () => {
        setPOForm(prev => ({
            ...prev,
            items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, unit: 'piece' }]
        }));
    };

    const removePOItem = (index) => {
        setPOForm(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    // Utility functions
    const calculateTotal = (items) => {
        return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    };

    const getDueStatus = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'overdue';
        if (diffDays <= 7) return 'due-soon';
        return 'upcoming';
    };

    const resetVendorForm = () => {
        setVendorForm({
            name: '',
            email: '',
            phone: '',
            address: '',
            registrationType: 'pan',
            panNumber: '',
            vatNumber: '',
            category: 'supplier',
            bankDetails: {
                accountName: '',
                accountNumber: '',
                bankName: '',
                branch: ''
            }
        });
        setSelectedVendor(null);
    };

    const resetPOForm = () => {
        setPOForm({
            vendorId: '',
            items: [{ description: '', quantity: 1, unitPrice: 0, unit: 'piece' }],
            dueDate: '',
            paymentTerms: '',
            tax: 0,
            discount: 0,
            notes: ''
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vendor Management</h1>
                    <div className="space-x-4">
                        <button
                            onClick={() => {
                                setSelectedVendor(null);
                                setVendorForm({
                                    name: '',
                                    email: '',
                                    phone: '',
                                    address: '',
                                    registrationType: 'pan',
                                    panNumber: '',
                                    vatNumber: '',
                                    category: 'supplier',
                                    bankDetails: {
                                        accountName: '',
                                        accountNumber: '',
                                        bankName: '',
                                        branch: ''
                                    }
                                });
                                setShowVendorModal(true);
                            }}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            <FiPlus className="mr-2" /> Add Vendor
                        </button>
                        <button
                            onClick={() => setShowPOModal(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                        >
                            <FiPlus className="mr-2" /> Create PO
                        </button>
                    </div>
                </div>

                {/* Vendors List */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-8">
                    <div className="px-4 py-5 sm:px-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Vendors</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">PAN/VAT</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {vendors.map((vendor) => (
                                    <tr key={vendor._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{vendor.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">{vendor.email}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{vendor.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">PAN: {vendor.panNumber}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">VAT: {vendor.vatNumber || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                {vendor.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setSelectedVendor(vendor);
                                                    setVendorForm(vendor);
                                                    setShowVendorModal(true);
                                                }}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                <FiEdit2 className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm('Are you sure you want to delete this vendor?')) {
                                                        try {
                                                            await axios.delete(`/api/vendors/${vendor._id}`);
                                                            toast.success('Vendor deleted successfully');
                                                            fetchVendors();
                                                        } catch (error) {
                                                            toast.error('Failed to delete vendor');
                                                        }
                                                    }
                                                }}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <FiTrash2 className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Purchase Orders List */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg mt-8">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Purchase Orders</h2>
                        <button
                            onClick={() => setShowPOModal(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            <FiPlus className="mr-2" /> Create PO
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Order #</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Vendor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Items</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Due Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {purchaseOrders.map((po) => (
                                    <tr key={po._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{po.orderNumber}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">{po.vendorId.name}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{po.vendorId.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {po.items.length} items
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {po.items.map(item => item.description).join(', ')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                ${po.total.toFixed(2)}
                                            </div>
                                            {po.paymentStatus !== 'unpaid' && (
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    po.paymentStatus === 'paid' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {po.paymentStatus}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`text-sm ${
                                                getDueStatus(po.dueDate) === 'overdue'
                                                    ? 'text-red-600'
                                                    : getDueStatus(po.dueDate) === 'due-soon'
                                                    ? 'text-yellow-600'
                                                    : 'text-gray-900 dark:text-white'
                                            }`}>
                                                {new Date(po.dueDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                po.status === 'approved'
                                                    ? 'bg-green-100 text-green-800'
                                                    : po.status === 'rejected'
                                                    ? 'bg-red-100 text-red-800'
                                                    : po.status === 'cancelled'
                                                    ? 'bg-gray-100 text-gray-800'
                                                    : po.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {po.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-3">
                                                {po.status === 'draft' && (
                                                    <>
                                                        <button
                                                            onClick={() => handlePOStatusUpdate(po, 'pending')}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                            title="Submit for approval"
                                                        >
                                                            <FiClock className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                if (window.confirm('Are you sure you want to delete this purchase order?')) {
                                                                    try {
                                                                        await axios.delete(`/api/purchase-orders/${po._id}`);
                                                                        toast.success('Purchase order deleted');
                                                                        fetchPurchaseOrders();
                                                                    } catch (error) {
                                                                        toast.error('Failed to delete purchase order');
                                                                    }
                                                                }
                                                            }}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Delete"
                                                        >
                                                            <FiTrash2 className="h-5 w-5" />
                                                        </button>
                                                    </>
                                                )}
                                                {po.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handlePOStatusUpdate(po, 'approved')}
                                                            className="text-green-600 hover:text-green-900"
                                                            title="Approve"
                                                        >
                                                            <FiCheckCircle className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handlePOStatusUpdate(po, 'rejected')}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Reject"
                                                        >
                                                            <FiTrash2 className="h-5 w-5" />
                                                        </button>
                                                    </>
                                                )}
                                                {po.status === 'approved' && po.paymentStatus !== 'paid' && (
                                                    <div className="flex items-center space-x-2">
                                                        <select
                                                            value={paymentMethod}
                                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                                            className="block w-32 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-1 px-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                        >
                                                            <option value="">Payment Method</option>
                                                            <option value="cash">Cash</option>
                                                            <option value="bank-transfer">Bank Transfer</option>
                                                            <option value="cheque">Cheque</option>
                                                        </select>
                                                        <button
                                                            onClick={() => handlePayment(po)}
                                                            className="text-green-600 hover:text-green-900"
                                                            title="Process Payment"
                                                        >
                                                            <FiDollarSign className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Vendor Modal */}
                {showVendorModal && (
                    <div className="fixed z-10 inset-0 overflow-y-auto">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>
                            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                                <form onSubmit={handleVendorSubmit}>
                                    <div>
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                                            {selectedVendor ? 'Edit Vendor' : 'Add New Vendor'}
                                        </h3>
                                        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                            <div className="sm:col-span-6">
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Vendor Name
                                                </label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    id="name"
                                                    value={vendorForm.name}
                                                    onChange={handleVendorInputChange}
                                                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>

                                            <div className="sm:col-span-6 mb-4">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Registration Type
                                                </label>
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            id="pan"
                                                            name="registrationType"
                                                            value="pan"
                                                            checked={vendorForm.registrationType === 'pan'}
                                                            onChange={handleVendorInputChange}
                                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                                        />
                                                        <label htmlFor="pan" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                                            PAN Number
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            id="vat"
                                                            name="registrationType"
                                                            value="vat"
                                                            checked={vendorForm.registrationType === 'vat'}
                                                            onChange={handleVendorInputChange}
                                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                                        />
                                                        <label htmlFor="vat" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                                            VAT Number
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="sm:col-span-6">
                                                <label htmlFor={vendorForm.registrationType + "Number"} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {vendorForm.registrationType.toUpperCase()} Number
                                                </label>
                                                <input
                                                    type="text"
                                                    name={vendorForm.registrationType + "Number"}
                                                    id={vendorForm.registrationType + "Number"}
                                                    value={vendorForm.registrationType === 'pan' ? vendorForm.panNumber : vendorForm.vatNumber}
                                                    onChange={handleVendorInputChange}
                                                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    placeholder={`Enter ${vendorForm.registrationType.toUpperCase()} number`}
                                                />
                                            </div>

                                            <div className="sm:col-span-6">
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    id="email"
                                                    value={vendorForm.email}
                                                    onChange={handleVendorInputChange}
                                                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>

                                            <div className="sm:col-span-6">
                                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Phone
                                                </label>
                                                <input
                                                    type="text"
                                                    name="phone"
                                                    id="phone"
                                                    value={vendorForm.phone}
                                                    onChange={handleVendorInputChange}
                                                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>

                                            <div className="sm:col-span-6">
                                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Address
                                                </label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    id="address"
                                                    value={vendorForm.address}
                                                    onChange={handleVendorInputChange}
                                                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                        <button
                                            type="submit"
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                                        >
                                            {selectedVendor ? 'Update' : 'Save'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowVendorModal(false)}
                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Purchase Order Modal */}
                {showPOModal && (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Create Purchase Order</h3>
                            </div>
                            <form onSubmit={handlePOSubmit} className="p-6">
                                <div className="grid grid-cols-1 gap-6">
                                    {/* Vendor Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Vendor *
                                        </label>
                                        <select
                                            name="vendorId"
                                            value={poForm.vendorId}
                                            onChange={handlePOInputChange}
                                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            required
                                        >
                                            <option value="">Select Vendor</option>
                                            {vendors.map(vendor => (
                                                <option key={vendor._id} value={vendor._id}>
                                                    {vendor.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Items */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Items *
                                        </label>
                                        {poForm.items.map((item, index) => (
                                            <div key={index} className="grid grid-cols-12 gap-4 mb-4">
                                                <div className="col-span-5">
                                                    <input
                                                        type="text"
                                                        name={`items.${index}.description`}
                                                        placeholder="Item description"
                                                        value={item.description}
                                                        onChange={(e) => handlePOInputChange(e, index)}
                                                        className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        required
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <input
                                                        type="number"
                                                        name={`items.${index}.quantity`}
                                                        placeholder="Qty"
                                                        value={item.quantity}
                                                        onChange={(e) => handlePOInputChange(e, index)}
                                                        className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        min="1"
                                                        required
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <select
                                                        name={`items.${index}.unit`}
                                                        value={item.unit}
                                                        onChange={(e) => handlePOInputChange(e, index)}
                                                        className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    >
                                                        <option value="piece">Piece</option>
                                                        <option value="kg">KG</option>
                                                        <option value="meter">Meter</option>
                                                        <option value="liter">Liter</option>
                                                    </select>
                                                </div>
                                                <div className="col-span-2">
                                                    <input
                                                        type="number"
                                                        name={`items.${index}.unitPrice`}
                                                        placeholder="Price"
                                                        value={item.unitPrice}
                                                        onChange={(e) => handlePOInputChange(e, index)}
                                                        className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        min="0"
                                                        step="0.01"
                                                        required
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    {index > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removePOItem(index)}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            <FiTrash2 className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addPOItem}
                                            className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            <FiPlus className="mr-2" /> Add Item
                                        </button>
                                    </div>

                                    {/* Additional Details */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Due Date *
                                            </label>
                                            <input
                                                type="date"
                                                name="dueDate"
                                                value={poForm.dueDate}
                                                onChange={handlePOInputChange}
                                                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Payment Terms
                                            </label>
                                            <input
                                                type="text"
                                                name="paymentTerms"
                                                value={poForm.paymentTerms}
                                                onChange={handlePOInputChange}
                                                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                placeholder="e.g., Net 30"
                                            />
                                        </div>
                                    </div>

                                    {/* Tax and Discount */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Tax Amount
                                            </label>
                                            <input
                                                type="number"
                                                name="tax"
                                                value={poForm.tax}
                                                onChange={handlePOInputChange}
                                                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Discount Amount
                                            </label>
                                            <input
                                                type="number"
                                                name="discount"
                                                value={poForm.discount}
                                                onChange={handlePOInputChange}
                                                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Notes
                                        </label>
                                        <textarea
                                            name="notes"
                                            value={poForm.notes}
                                            onChange={handlePOInputChange}
                                            rows={3}
                                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="Additional notes or instructions..."
                                        />
                                    </div>
                                </div>

                                {/* Modal Actions */}
                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPOModal(false);
                                            resetPOForm();
                                        }}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        {loading ? 'Creating...' : 'Create Purchase Order'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Vendors;
