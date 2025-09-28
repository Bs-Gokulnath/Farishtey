import React from "react";

const Loading = ({ message = "Loading...", size = "default", fullScreen = false }) => {
  const sizeClasses = {
    small: "w-6 h-6",
    default: "w-8 h-8",
    large: "w-12 h-12",
    xlarge: "w-16 h-16"
  };

  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center">
      <div className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}></div>
      <p className="mt-3 text-gray-600 font-medium text-sm">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner />
    </div>
  );
};

// Inline loading spinner for buttons
export const ButtonLoading = () => (
  <div className="flex items-center justify-center">
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
    Processing...
  </div>
);

// Table row loading skeleton
export const TableRowLoading = ({ columns = 5 }) => (
  <tr className="border-b bg-gray-50 animate-pulse">
    {Array.from({ length: columns }).map((_, index) => (
      <td key={index} className="p-3">
        <div className="h-4 bg-gray-300 rounded"></div>
      </td>
    ))}
  </tr>
);

// Card loading skeleton
export const CardLoading = () => (
  <div className="border-2 border-gray-200 rounded-lg p-6 animate-pulse">
    <div className="space-y-4">
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      <div className="h-4 bg-gray-300 rounded w-2/3"></div>
    </div>
  </div>
);

export default Loading;