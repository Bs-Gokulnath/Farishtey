import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';

const Unauthorized = () => {
  return (
    <div className="relative min-h-screen w-full bg-[#A7C7E7]">
      <Header />
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-white/80 p-8 rounded-2xl shadow-xl border max-w-md mx-4">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>
          <div className="space-y-3">
            <Link
              to="/"
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Home
            </Link>
            <Link
              to="/signin"
              className="block w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
