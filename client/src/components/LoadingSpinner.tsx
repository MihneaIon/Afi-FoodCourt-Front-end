import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text = 'Loading...',
  fullScreen = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Spinner */}
      <div className="relative">
        <div
          className={`${sizeClasses[size]} border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin`}
        />
        {/* Optional pulsing background */}
        <div
          className={`${sizeClasses[size]} border-4 border-primary-100 rounded-full absolute top-0 left-0 animate-pulse`}
        />
      </div>
      
      {/* Loading text */}
      {text && (
        <p className={`mt-4 text-gray-600 ${textSizes[size]} font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {spinner}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {spinner}
    </div>
  );
};

// Alternative skeleton loading component
export const SkeletonLoader: React.FC<{ 
  lines?: number; 
  className?: string;
  showAvatar?: boolean;
}> = ({ 
  lines = 3, 
  className = '',
  showAvatar = false 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="flex space-x-4">
        {showAvatar && (
          <div className="rounded-full bg-gray-300 h-10 w-10"></div>
        )}
        <div className="flex-1 space-y-2 py-1">
          {[...Array(lines)].map((_, index) => (
            <div
              key={index}
              className={`h-4 bg-gray-300 rounded ${
                index === lines - 1 ? 'w-3/4' : 'w-full'
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Card skeleton for restaurant cards
export const RestaurantCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="h-48 bg-gray-300"></div>
      
      {/* Content skeleton */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="h-6 bg-gray-300 rounded w-3/4"></div>
          <div className="h-5 bg-gray-300 rounded w-16"></div>
        </div>
        
        <div className="flex space-x-2 mb-2">
          <div className="h-6 bg-gray-300 rounded-full w-16"></div>
          <div className="h-6 bg-gray-300 rounded-full w-20"></div>
        </div>
        
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
        </div>
        
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-3"></div>
        
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-300 rounded w-20"></div>
          <div className="h-4 bg-gray-300 rounded w-24"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
