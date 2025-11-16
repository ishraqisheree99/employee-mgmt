// src/components/Toast.jsx
import { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimesCircle, FaTimes } from 'react-icons/fa';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <FaCheckCircle className="text-green-500" />,
    error: <FaTimesCircle className="text-red-500" />,
    warning: <FaExclamationCircle className="text-yellow-500" />,
    info: <FaInfoCircle className="text-blue-500" />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-4 shadow-lg ${bgColors[type]} animate-slide-in-right`}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <p className={`flex-1 font-medium ${textColors[type]}`}>{message}</p>
      <button
        onClick={onClose}
        className={`flex-shrink-0 rounded p-1 hover:bg-opacity-20 ${textColors[type]} hover:bg-gray-400 transition-colors`}
        aria-label="Close"
      >
        <FaTimes className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;

