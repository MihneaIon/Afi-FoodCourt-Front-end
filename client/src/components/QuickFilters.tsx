import React from 'react';
import { useRestaurantStore } from '../store/restuarantStore';

const QuickFilters: React.FC = () => {
  const { filters, setFilters, setPriceRange, setRatingFilter } = useRestaurantStore();

  const quickFilters = [
    { 
      label: 'Top Rated', 
      action: () => setRatingFilter(4.5),
      active: filters.rating === 4.5,
      icon: '⭐'
    },
    { 
      label: 'Budget', 
      action: () => setPriceRange('$'),
      active: filters.priceRange === '$',
      icon: '💰'
    },
    { 
      label: 'Fast Food', 
      action: () => setFilters({ category: 'fast-food' }),
      active: filters.category === 'fast-food',
      icon: '🍔'
    },
    { 
      label: 'Italian', 
      action: () => setFilters({ category: 'italian' }),
      active: filters.category === 'italian',
      icon: '🍝'
    },
  ];

  return (
    <div className="lg:hidden mb-4">
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {quickFilters.map((filter) => (
          <button
            key={filter.label}
            onClick={filter.action}
            className={`flex-shrink-0 inline-flex items-center px-3 py-2 rounded-full text-sm font-medium transition-colors ${
              filter.active
                ? 'bg-primary-100 text-primary-800 border-2 border-primary-300'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <span className="mr-1">{filter.icon}</span>
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickFilters;
