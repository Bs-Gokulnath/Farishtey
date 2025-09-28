import React, { useEffect, useState } from "react";

const Alert = ({ 
  message, 
  type = "info", 
  isVisible, 
  onClose, 
  duration = 4000,
  position = "center" 
}) => {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsShowing(true);
      
      // Auto-dismiss after duration
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, duration]);

  const handleClose = () => {
    setIsShowing(false);
    setTimeout(() => {
      onClose();
    }, 200); // Wait for fade out animation
  };

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          text: "text-green-800",
          icon: "✅",
          iconBg: "bg-green-100"
        };
      case "error":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-800",
          icon: "❌",
          iconBg: "bg-red-100"
        };
      case "warning":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          text: "text-yellow-800",
          icon: "⚠️",
          iconBg: "bg-yellow-100"
        };
      case "info":
      default:
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-800",
          icon: "ℹ️",
          iconBg: "bg-blue-100"
        };
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case "top":
        return "top-4 left-1/2 transform -translate-x-1/2";
      case "bottom":
        return "bottom-4 left-1/2 transform -translate-x-1/2";
      case "top-right":
        return "top-4 right-4";
      case "top-left":
        return "top-4 left-4";
      case "bottom-right":
        return "bottom-4 right-4";
      case "bottom-left":
        return "bottom-4 left-4";
      case "center":
      default:
        return "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";
    }
  };

  const styles = getTypeStyles();
  const positionStyles = getPositionStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Alert Container */}
      <div 
        className={`relative ${positionStyles} max-w-sm w-full mx-4`}
        style={{
          animation: isShowing ? 'slideIn 0.3s ease-out' : 'slideOut 0.2s ease-in'
        }}
      >
        <div className={`
          ${styles.bg} ${styles.border} ${styles.text}
          border rounded-lg shadow-lg p-4 backdrop-blur-sm
          transform transition-all duration-200 ease-out
          ${isShowing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        `}>
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`${styles.iconBg} w-8 h-8 rounded-full flex items-center justify-center text-lg`}>
                {styles.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">
                  {type === "success" && "Success"}
                  {type === "error" && "Error"}
                  {type === "warning" && "Warning"}
                  {type === "info" && "Information"}
                </h3>
              </div>
            </div>
            
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Message */}
          <div className="mt-3">
            <p className="text-sm leading-relaxed">{message}</p>
          </div>
          
          {/* Progress Bar for auto-dismiss */}
          {duration > 0 && (
            <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
              <div 
                className={`h-1 rounded-full transition-all duration-100 ease-linear ${
                  type === "success" ? "bg-green-500" :
                  type === "error" ? "bg-red-500" :
                  type === "warning" ? "bg-yellow-500" :
                  "bg-blue-500"
                }`}
                style={{
                  width: isShowing ? '100%' : '0%',
                  transition: `width ${duration}ms linear`
                }}
              />
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        
        @keyframes slideOut {
          from {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          to {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
        }
      `}</style>
    </div>
  );
};

export default Alert;
