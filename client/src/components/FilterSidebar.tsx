import React from 'react';
import { useRestaurantStore } from '../store/restuarantStore';
import { Category } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface FilterSidebarProps {
  categories: Category[];
  loading: boolean;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ categories, loading }) => {
  const { 
    filters, 
    setFilters, 
    setPriceRange, 
    setRatingFilter, 
    setDiscountFilter,
    setMealTicketsFilter,
    clearFilters 
  } = useRestaurantStore();

  const priceRanges = [
    { value: '$', label: '$ - Budget (Under $15)', count: 0 },
    { value: '$$', label: '$$ - Moderate ($15-30)', count: 0 },
    { value: '$$$', label: '$$$ - Expensive ($30-60)', count: 0 },
    { value: '$$$$', label: '$$$$ - Very Expensive ($60+)', count: 0 }
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

  const handleDiscountChange = (discounted: boolean) => {
    setDiscountFilter(discounted);
  }

  const handleMealTicketsChange = (applyMealTickets: boolean) => {
    setMealTicketsFilter(applyMealTickets);
  }

  const activeFiltersCount = [
    filters.category,
    filters.priceRange,
    filters.rating,
    filters.discounted,
    filters.applyMealTickets,
    filters.search
  ].filter(Boolean).length;


return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Clear all ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Categories</h4>
        {loading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.category === category.slug}
                  onChange={() => handleCategoryChange(category.slug)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700 flex items-center">
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
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
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Minimum Rating</h4>
        <div className="space-y-2">
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
          {/* Discount */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Accept Afi Club Discount</h4>
        <div className="space-y-2">
          <label htmlFor="discount" className="flex items-center">
            <input type="checkbox" 
            checked={filters.discounted}
            onChange={() => handleDiscountChange(filters.discounted ? false : true)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"/>
            <span className="ml-3 text-sm text-gray-700 flex items-center">
              🫶 
            </span> Afi Club
          </label>
        </div>
      </div>

      {/* Meal Tickets */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Accept Meal Tichets</h4>
        <div className="space-y-2">
          <label htmlFor="mealTickets" className="flex items-center">
            <input type="checkbox" 
            checked={filters.applyMealTickets}
            onChange={() => handleMealTicketsChange(filters.applyMealTickets ? false : true)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"/>
            <span className="ml-3 text-sm text-gray-700 flex items-center">
              💳
            </span>
            Pluxee Card
          </label>
        </div>
      </div>

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Active Filters</h4>
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
            {filters.discounted && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                Afi Club Discount: {filters.discounted ? 'Yes' : 'No'}
                <button
                  onClick={() => setDiscountFilter(false)}
                  className="ml-1 text-pink-600 hover:text-pink-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.applyMealTickets && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Meal Tickets: {filters.applyMealTickets ? 'Yes' : 'No'}
                <button
                  onClick={() => setMealTicketsFilter(false)}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                > 
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSidebar;
