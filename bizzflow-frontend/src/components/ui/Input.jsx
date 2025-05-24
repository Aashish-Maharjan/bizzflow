import React from 'react';

export const Input = ({ className = '', ...props }) => {
  return (
    <input
      {...props}
      className={`w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${className}`}
    />
  );
};
