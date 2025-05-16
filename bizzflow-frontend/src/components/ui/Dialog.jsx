import React from 'react';

export const Dialog = ({ children }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-lg">
        {children}
      </div>
    </div>
  );
};
