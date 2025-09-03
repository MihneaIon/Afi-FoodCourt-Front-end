import React from 'react';
import { useRestaurantStore } from '../store/restuarantStore';
import { Category } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface MobileFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  loading: boolean;
}

const MobileFilterModal: React.FC<MobileFilterModalProps> = ({
  isOpen,
  onClose,
  categories,
  loading
}) => {
  const { 
    filters, 
    setFilters, 
    setPriceRange, 
    setRatingFilter, 
    clearFilters 
  } = useRestaurantStore();

  const priceRanges = [
    { value: '$', label: '$ - Budget (Under $15)' },
    { value: '$$', label: '$$ - Moderate ($15-30)' },
    { value: '$$$', label: '$$$ - Expensive ($30-60)' },
    { value: '$$$$', label: '$$$$ - Very Expensive ($60+)' }
  ];

  const ratingOptions = [
    { value: 4.5, label: '4.5+ stars' },
    { value: 4.0, label: '4.0+ stars' },
    { value: 3.5, label: '3.5+ stars' },
    { value: 3.0, label: '3.0+ stars' }
  ];

  const handleCategoryChange = (categorySlug: string) => {
    setFilters({ 
      category: filters.category === categorySlug ? undefined : categorySlug 
    });
  };

  const handlePriceRangeChange = (priceRange: string) => {
    setPriceRange(filters.priceRange === priceRange ? undefined : priceRange);
  };

  const handleRatingChange = (rating: number) => {
    setRatingFilter(filters.rating === rating ? undefined : rating);
  };

  const activeFiltersCount = [
    filters.category,
    filters.priceRange,
    filters.rating,
    filters.search
  ].filter(Boolean).length;

  const handleApplyFilters = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            <div className="flex items-center space-x-3">
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Clear all ({activeFiltersCount})
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Categories */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <div className="space-y-3">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.category === category.slug}
                        onChange={() => handleCategoryChange(category.slug)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-sm text-gray-700 flex items-center">
                        <span className="mr-2 text-lg">{category.icon}</span>
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Price Range</h3>
              <div className="space-y-3">
                {priceRanges.map((price) => (
                  <label key={price.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.priceRange === price.value}
                      onChange={() => handlePriceRangeChange(price.value)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      {price.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Minimum Rating</h3>
              <div className="space-y-3">
                {ratingOptions.map((rating) => (
                  <label key={rating.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.rating === rating.value}
                      onChange={() => handleRatingChange(rating.value)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700 flex items-center">
                      <span className="text-yellow-400 mr-1">⭐</span>
                      {rating.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Active Filters Summary */}
            {activeFiltersCount > 0 && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Active Filters</h4>
                <div className="flex flex-wrap gap-2">
                  {filters.category && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      Category: {categories.find(c => c.slug === filters.category)?.name}
                      <button
                        onClick={() => setFilters({ category: undefined })}
                        className="ml-1 text-primary-600 hover:text-primary-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.priceRange && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Price: {filters.priceRange}
                      <button
                        onClick={() => setPriceRange(undefined)}
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.rating && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Rating: {filters.rating}+ ⭐
                      <button
                        onClick={() => setRatingFilter(undefined)}
                        className="ml-1 text-yellow-600 hover:text-yellow-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-4 bg-gray-50">
            <button
              onClick={handleApplyFilters}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Apply Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 bg-primary-500 text-primary-100 px-2 py-1 rounded-full text-xs">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileFilterModal;
