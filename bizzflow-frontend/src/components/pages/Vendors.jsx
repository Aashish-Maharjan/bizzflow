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
        items: [{ description: '', quantity: 1, unitPrice: 0 }],
        dueDate: '',
        terms: '',
        category: 'inventory'
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
        } catch (error) {
            toast.error('Failed to save vendor');
        } finally {
            setLoading(false);
        }
    };

    const handlePOSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await axios.post('/api/purchase-orders', poForm);
            toast.success('Purchase order created successfully');
            setShowPOModal(false);
            fetchPurchaseOrders();
        } catch (error) {
            toast.error('Failed to create purchase order');
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
            // Integration with payment gateways would go here
            const paymentData = {
                amount: calculateTotal(purchaseOrder.items),
                orderId: purchaseOrder._id,
                vendorId: purchaseOrder.vendorId,
                method: paymentMethod
            };

            await axios.post('/api/payments', paymentData);
            toast.success('Payment processed successfully');
            fetchPurchaseOrders();
        } catch (error) {
            toast.error('Payment processing failed');
        } finally {
            setLoading(false);
        }
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

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
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
                <div className="bg-white shadow rounded-lg mb-8">
                    <div className="px-4 py-5 sm:px-6">
                        <h2 className="text-xl font-semibold text-gray-900">Vendors</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PAN/VAT</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {vendors.map((vendor) => (
                                    <tr key={vendor._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{vendor.email}</div>
                                            <div className="text-sm text-gray-500">{vendor.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">PAN: {vendor.panNumber}</div>
                                            <div className="text-sm text-gray-500">VAT: {vendor.vatNumber || 'N/A'}</div>
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
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h2 className="text-xl font-semibold text-gray-900">Purchase Orders</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {purchaseOrders.map((po) => (
                                    <tr key={po._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{po._id}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {vendors.find(v => v._id === po.vendorId)?.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                NPR {calculateTotal(po.items).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{new Date(po.dueDate).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                getDueStatus(po.dueDate) === 'overdue'
                                                    ? 'bg-red-100 text-red-800'
                                                    : getDueStatus(po.dueDate) === 'due-soon'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-green-100 text-green-800'
                                            }`}>
                                                {getDueStatus(po.dueDate)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    // Handle payment
                                                    handlePayment(po);
                                                }}
                                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                            >
                                                <FiDollarSign className="mr-1" /> Pay
                                            </button>
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
                            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                                <form onSubmit={handleVendorSubmit}>
                                    <div>
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            {selectedVendor ? 'Edit Vendor' : 'Add New Vendor'}
                                        </h3>
                                        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                            <div className="sm:col-span-6">
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                                    Vendor Name
                                                </label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    id="name"
                                                    value={vendorForm.name}
                                                    onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>

                                            <div className="sm:col-span-6 mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                                            onChange={(e) => setVendorForm({
                                                                ...vendorForm,
                                                                registrationType: e.target.value,
                                                                vatNumber: ''
                                                            })}
                                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                                        />
                                                        <label htmlFor="pan" className="ml-2 block text-sm text-gray-700">
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
                                                            onChange={(e) => setVendorForm({
                                                                ...vendorForm,
                                                                registrationType: e.target.value,
                                                                panNumber: ''
                                                            })}
                                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                                        />
                                                        <label htmlFor="vat" className="ml-2 block text-sm text-gray-700">
                                                            VAT Number
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="sm:col-span-6">
                                                <label htmlFor={vendorForm.registrationType + "Number"} className="block text-sm font-medium text-gray-700">
                                                    {vendorForm.registrationType.toUpperCase()} Number
                                                </label>
                                                <input
                                                    type="text"
                                                    name={vendorForm.registrationType + "Number"}
                                                    id={vendorForm.registrationType + "Number"}
                                                    value={vendorForm.registrationType === 'pan' ? vendorForm.panNumber : vendorForm.vatNumber}
                                                    onChange={(e) => setVendorForm({
                                                        ...vendorForm,
                                                        [vendorForm.registrationType + "Number"]: e.target.value
                                                    })}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    placeholder={`Enter ${vendorForm.registrationType.toUpperCase()} number`}
                                                />
                                            </div>

                                            <div className="sm:col-span-6">
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    id="email"
                                                    value={vendorForm.email}
                                                    onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>

                                            <div className="sm:col-span-6">
                                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                                    Phone
                                                </label>
                                                <input
                                                    type="text"
                                                    name="phone"
                                                    id="phone"
                                                    value={vendorForm.phone}
                                                    onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>

                                            <div className="sm:col-span-6">
                                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                                    Address
                                                </label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    id="address"
                                                    value={vendorForm.address}
                                                    onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
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
                    <div className="fixed z-10 inset-0 overflow-y-auto">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>
                            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                                <form onSubmit={handlePOSubmit}>
                                    <div>
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Create Purchase Order</h3>
                                        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                            <div className="sm:col-span-6">
                                                <label htmlFor="vendor" className="block text-sm font-medium text-gray-700">
                                                    Select Vendor
                                                </label>
                                                <select
                                                    id="vendor"
                                                    name="vendor"
                                                    value={poForm.vendorId}
                                                    onChange={(e) => setPOForm({ ...poForm, vendorId: e.target.value })}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                >
                                                    <option value="">Select a vendor</option>
                                                    {vendors.map((vendor) => (
                                                        <option key={vendor._id} value={vendor._id}>
                                                            {vendor.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Dynamic items list */}
                                            {poForm.items.map((item, index) => (
                                                <div key={index} className="sm:col-span-6 grid grid-cols-12 gap-4">
                                                    <div className="col-span-6">
                                                        <label className="block text-sm font-medium text-gray-700">Description</label>
                                                        <input
                                                            type="text"
                                                            value={item.description}
                                                            onChange={(e) => {
                                                                const newItems = [...poForm.items];
                                                                newItems[index].description = e.target.value;
                                                                setPOForm({ ...poForm, items: newItems });
                                                            }}
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        />
                                                    </div>
                                                    <div className="col-span-3">
                                                        <label className="block text-sm font-medium text-gray-700">Quantity</label>
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => {
                                                                const newItems = [...poForm.items];
                                                                newItems[index].quantity = parseInt(e.target.value);
                                                                setPOForm({ ...poForm, items: newItems });
                                                            }}
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        />
                                                    </div>
                                                    <div className="col-span-3">
                                                        <label className="block text-sm font-medium text-gray-700">Unit Price</label>
                                                        <input
                                                            type="number"
                                                            value={item.unitPrice}
                                                            onChange={(e) => {
                                                                const newItems = [...poForm.items];
                                                                newItems[index].unitPrice = parseFloat(e.target.value);
                                                                setPOForm({ ...poForm, items: newItems });
                                                            }}
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="sm:col-span-6">
                                                <button
                                                    type="button"
                                                    onClick={() => setPOForm({
                                                        ...poForm,
                                                        items: [...poForm.items, { description: '', quantity: 1, unitPrice: 0 }]
                                                    })}
                                                    className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                >
                                                    Add Item
                                                </button>
                                            </div>

                                            <div className="sm:col-span-6">
                                                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                                                    Due Date
                                                </label>
                                                <input
                                                    type="date"
                                                    id="dueDate"
                                                    name="dueDate"
                                                    value={poForm.dueDate}
                                                    onChange={(e) => setPOForm({ ...poForm, dueDate: e.target.value })}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                        <button
                                            type="submit"
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                                        >
                                            Create PO
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowPOModal(false)}
                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Vendors;
