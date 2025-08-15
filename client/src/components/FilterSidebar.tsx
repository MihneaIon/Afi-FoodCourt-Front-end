import React from 'react';
import { useRestaurantStore } from '../store/restuarantStore';
import { Category } from '../types';

interface FilterSidebarProps {
  categories: Category[];
  loading: boolean;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ categories, loading }) => {
  const { filters, setFilters, clearFilters } = useRestaurantStore();

  const priceRanges = [
    { value: '$', label: '$ - Budget' },
    { value: '$$', label: '$$ - Moderate' },
    { value: '$$$', label: '$$$ - Expensive' },
    { value: '$$$$', label: '$$$$ - Very Expensive' },
  ];

  const ratings = [
    { value: 4, label: '4+ Stars' },
    { value: 3, label: '3+ Stars' },
    { value: 2, label: '2+ Stars' },
    { value: 1, label: '1+ Stars' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          Clear all
        </button>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Categories</h4>
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center">
                <input
                  type="radio"
                  name="category"
                  value={category.slug}
                  checked={filters.category === category.slug}
                  onChange={(e) => setFilters({ 
                    category: e.target.checked ? category.slug : undefined 
                  })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {category.icon} {category.name}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Price Range</h4>
        <div className="space-y-2">
          {priceRanges.map((price) => (
            <label key={price.value} className="flex items-center">
              <input
                type="radio"
                name="priceRange"
                value={price.value}
                checked={filters.priceRange === price.value}
                onChange={(e) => setFilters({ 
                  priceRange: e.target.checked ? price.value : undefined 
                })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">{price.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Minimum Rating</h4>
        <div className="space-y-2">
          {ratings.map((rating) => (
            <label key={rating.value} className="flex items-center">
              <input
                type="radio"
                name="rating"
                value={rating.value}
                checked={filters.rating === rating.value}
                onChange={(e) => setFilters({ 
                  rating: e.target.checked ? rating.value : undefined 
                })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">{rating.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
