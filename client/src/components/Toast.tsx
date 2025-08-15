import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastProps extends Toast {
  onRemove: (id: string) => void;
}

const ToastComponent: React.FC<ToastProps> = ({ 
  id, 
  message, 
  type, 
  duration = 5000, 
  onRemove 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(id), 300); // Wait for animation
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onRemove]);

  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white'
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${typeStyles[type]}
        rounded-lg shadow-lg p-4 mb-2 flex items-center space-x-3
        max-w-sm w-full
      `}
    >
      <span className="text-lg">{getIcon()}</span>
      <span className="flex-1">{message}</span>
      <button
        onClick={() => onRemove(id)}
        className="text-white hover:text-gray-200 transition-colors"
      >
        ✕
      </button>
    </div>
  );
};

// Toast Container
export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Expose globally
  useEffect(() => {
    (window as any).addToast = addToast;
    return () => {
      delete (window as any).addToast;
    };
  }, []);

  return createPortal(
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastComponent
          key={toast.id}
          {...toast}
          onRemove={removeToast}
        />
      ))}
    </div>,
    document.body
  );
};

// Helper functions
export const showToast = {
  success: (message: string) => (window as any).addToast?.({ message, type: 'success' }),
  error: (message: string) => (window as any).addToast?.({ message, type: 'error' }),
  warning: (message: string) => (window as any).addToast?.({ message, type: 'warning' }),
  info: (message: string) => (window as any).addToast?.({ message, type: 'info' })
};
