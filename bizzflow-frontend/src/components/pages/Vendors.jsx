import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { BellIcon } from 'lucide-react';
import axios from 'axios';

const Vendor = () => {
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState({
    name: '',
    panVat: '',
    category: '',
    dueDate: '',
    amount: '',
  });

  const fetchVendors = async () => {
    try {
      const res = await axios.get('/api/vendors');
      setVendors(res.data);
    } catch (err) {
      console.error('Error fetching vendors', err);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddVendor = async () => {
    try {
      await axios.post('/api/vendors', form);
      setForm({ name: '', panVat: '', category: '', dueDate: '', amount: '' });
      fetchVendors();
    } catch (err) {
      console.error('Error adding vendor', err);
    }
  };

  const handlePayment = async (vendorId, method) => {
    alert(`Initiate ${method} payment for Vendor ID: ${vendorId}`);
    // await axios.post(`/api/vendors/pay/${vendorId}`, { method });
    fetchVendors();
  };

  return (
    <div className="p-4 space-y-6">
      <Card title="Add New Vendor">
        <div className="grid gap-3">
          <Input name="name" placeholder="Vendor Name" value={form.name} onChange={handleChange} />
          <Input name="panVat" placeholder="PAN/VAT Number" value={form.panVat} onChange={handleChange} />
          <Input name="category" placeholder="Expense Category" value={form.category} onChange={handleChange} />
          <Input name="dueDate" type="date" placeholder="Payment Due Date" value={form.dueDate} onChange={handleChange} />
          <Input name="amount" type="number" placeholder="Amount" value={form.amount} onChange={handleChange} />
          <Button onClick={handleAddVendor}>Save Vendor</Button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vendors.map((vendor) => (
          <Card
            key={vendor._id}
            title={vendor.name}
            value={`Rs. ${vendor.amount}`}
          >
            <p className="text-sm">PAN/VAT: {vendor.panVat}</p>
            <p className="text-sm">Category: {vendor.category}</p>
            <p className="text-sm">Due Date: {new Date(vendor.dueDate).toLocaleDateString()}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Button onClick={() => handlePayment(vendor._id, 'eSewa')} size="sm">
                Pay via eSewa
              </Button>
              <Button onClick={() => handlePayment(vendor._id, 'Khalti')} size="sm">
                Pay via Khalti
              </Button>
              <Button onClick={() => handlePayment(vendor._id, 'FonePay')} size="sm">
                Pay via FonePay
              </Button>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
              <BellIcon size={16} />
              {new Date(vendor.dueDate) < new Date() ? 'Payment Due' : 'No due'}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Vendor;
