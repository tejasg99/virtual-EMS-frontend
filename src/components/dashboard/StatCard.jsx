import React from 'react';

function StatCard({ title, value, icon, isLoading }) {
  return (
    <div className="bg-white p-5 rounded-lg shadow border border-gray-200 flex items-center space-x-4">
      <div className="flex-shrink-0 bg-indigo-100 text-indigo-600 rounded-full p-3">
        {/* Render icon passed as prop */}
        {icon && React.cloneElement(icon, { className: "h-6 w-6" })}
      </div>
      <div>
        <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
        <dd className="mt-1 text-2xl font-semibold text-gray-900">
          {isLoading ? (
            <span className="inline-block h-6 w-12 bg-gray-200 rounded animate-pulse"></span>
          ) : (
            value ?? '0' // Display value or 0 if null/undefined
          )}
        </dd>
      </div>
    </div>
  );
}

export default StatCard;