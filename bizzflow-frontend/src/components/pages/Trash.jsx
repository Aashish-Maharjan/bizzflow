import React, { useState } from 'react';
import { Trash2, RefreshCcw, XCircle } from 'lucide-react';

const Trash = () => {
  // Example deleted items - in a real app, this would come from your backend
  const [deletedItems, setDeletedItems] = useState([
    {
      id: 1,
      name: 'Project A',
      type: 'Task',
      deletedAt: '2024-03-20T10:00:00',
      deletedBy: 'John Doe'
    },
    {
      id: 2,
      name: 'Vendor XYZ',
      type: 'Vendor',
      deletedAt: '2024-03-19T15:30:00',
      deletedBy: 'Jane Smith'
    }
  ]);

  const handleRestore = (id) => {
    // Implement restore logic here
    setDeletedItems(deletedItems.filter(item => item.id !== id));
    // You would also want to send this to your backend
  };

  const handlePermanentDelete = (id) => {
    // Implement permanent delete logic here
    setDeletedItems(deletedItems.filter(item => item.id !== id));
    // You would also want to send this to your backend
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

      {deletedItems.length === 0 ? (
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
                    {item.deletedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(item.deletedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleRestore(item.id)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                    >
                      <RefreshCcw className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(item.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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