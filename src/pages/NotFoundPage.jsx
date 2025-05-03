import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineExclamationCircle } from 'react-icons/hi'; // Icon for emphasis

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4">
      <HiOutlineExclamationCircle className="w-16 h-16 text-red-500 mb-4" />
      <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-2">
        404
      </h1>
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
        Page Not Found
      </h2>
      <p className="text-gray-600 mb-8 max-w-md">
        Oops! The page you are looking for does not exist. It might have been moved or deleted.
      </p>
      <Link
        to="/"
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Go Back Home
      </Link>
    </div>
  );
}

export default NotFoundPage;