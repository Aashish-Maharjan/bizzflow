import React, { useState, useEffect } from 'react';
import { Trash2, RefreshCcw, XCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Trash = () => {
  const [deletedItems, setDeletedItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDeletedItems();
  }, []);

  const fetchDeletedItems = async () => {
    setLoading(true);
    try {
      // Fetch deleted vendors
      const vendorsResponse = await axios.get('/api/vendors', {
        params: { status: 'deleted' }
      });
      const vendors = vendorsResponse.data.map(vendor => ({
        id: vendor._id,
        name: vendor.name,
        type: 'Vendor',
        deletedAt: vendor.deletedAt,
        deletedBy: vendor.deletedBy?.name || 'Unknown',
        details: `${vendor.email} | ${vendor.phone}`
      }));

      // Fetch deleted purchase orders
      const posResponse = await axios.get('/api/purchase-orders', {
        params: { status: 'deleted' }
      });
      const purchaseOrders = posResponse.data.map(po => ({
        id: po._id,
        name: po.orderNumber,
        type: 'Purchase Order',
        deletedAt: po.deletedAt,
        deletedBy: po.deletedBy?.name || 'Unknown',
        details: `Vendor: ${po.vendorId.name} | Total: $${po.total.toFixed(2)}`
      }));

      setDeletedItems([...vendors, ...purchaseOrders]);
    } catch (error) {
      toast.error('Failed to fetch deleted items');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (item) => {
    try {
      setLoading(true);
      const endpoint = item.type === 'Vendor' 
        ? `/api/vendors/${item.id}/restore`
        : `/api/purchase-orders/${item.id}/restore`;

      await axios.post(endpoint);
      toast.success(`${item.type} restored successfully`);
      setDeletedItems(deletedItems.filter(i => i.id !== item.id));
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to restore ${item.type.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePermanentDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to permanently delete this ${item.type.toLowerCase()}? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      const endpoint = item.type === 'Vendor' 
        ? `/api/vendors/${item.id}/permanent`
        : `/api/purchase-orders/${item.id}/permanent`;

      await axios.delete(endpoint);
      toast.success(`${item.type} permanently deleted`);
      setDeletedItems(deletedItems.filter(i => i.id !== item.id));
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to delete ${item.type.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Trash2 className="w-6 h-6" />
          Trash
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Items in the trash will be automatically deleted after 30 days
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      ) : deletedItems.length === 0 ? (
        <div className="text-center py-12">
          <Trash2 className="w-12 h-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No items in trash
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Items you delete will appear here
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Deleted By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Deleted At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {deletedItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {item.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {item.details}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {item.deletedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(item.deletedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleRestore(item)}
                      disabled={loading}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                      title="Restore"
                    >
                      <RefreshCcw className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(item)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      title="Delete Permanently"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Trash; 