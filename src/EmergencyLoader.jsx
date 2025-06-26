import React from 'react';

const EmergencyLoader = ({ message }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white text-xl p-4 text-center">
      <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-24 w-24 mb-4" style={{ borderTopColor: '#3498db' }}></div>
      <p className="text-2xl font-semibold">{message || "Initializing application and Firebase..."}</p>
      <p className="text-gray-400 text-sm mt-2">Please wait a moment.</p>
    </div>
  );
};

export default EmergencyLoader;